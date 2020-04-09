/**
 * [framework] socket管理类
 * - 网络相关接口定义
 * - 网络连接、断开、请求发送、数据接收等基础功能
 * - 心跳机制
 * - 断线重连 + 请求重发
 * - 调用网络屏蔽层
 */
type ConnectFunc = () => void
type ReceiveFunc = (buffer: SocketData) => void
type CertifiFunc = (callback: ConnectFunc) => void
export type SocketData = (ArrayBufferLike | string | Blob | ArrayBufferView)
export type SocketCallFunc = (cmd: number, data: any) => void
import { BufManager } from "../network/BufManager" 
import { ClientConfig } from "../config/ClientConfig"

/**
 * socket连接状态
 * @param Closed 已关闭
 * @param Connecting 连接中
 * @param Checking 验证中
 * @param Working 可传输数据
 */
enum ScoketStates {
    Closed,
    Connecting,
    Checking,
    Working,
}

// 回调对象
export interface inter_callbackObject {
    target: any,                                                     // 回调对象, 不为null时调用target.callback(xxx)
    callback: SocketCallFunc,                                        // 回调函数
}

// 请求对象
export interface inter_requestObject {
    buffer: SocketData,                                              // 请求的Buffer
    rspCmd: number,                                                  // 等待响应指令
    rspObject: inter_callbackObject,                                 // 等待响应的回调对象
}

export class SocketManager {
    public state: ScoketStates = ScoketStates.Closed                             // 节点当前状态
    public curSocketID: number = 0                                                     // 当前socketID

    private _channels: { [key: number]: WebSocket } = {}
    private _socketData: any = null                                   // socekt连接地址
    private _connectFunc: ConnectFunc = null                                           // 连接成功回调函数
    private _receiveFunc: ReceiveFunc = null                                           // 接收数据回调函数
    private _certifiFunc: CertifiFunc = null                                           // 鉴权回调函数
    private _autoReconnect: number = 5                                                 // 断线自动重连次数
    private _requests: inter_requestObject[] = Array<inter_requestObject>()            // 请求列表
    public _keepAliveTimer: any                                              // 心跳定时器
    private _receiveMsgTimer: any                                                      // 接收数据定时器
    private _heartTime: number = 15000                                                 // 心跳间隔
    private _receiveTime: number = 600000                                              // 多久没收到数据断开

    // 设计成单例模式
    private static _instance: SocketManager = null
    public static GetInstance(): SocketManager {
        if (this._instance == null) {
            this._instance = new SocketManager()
        }
        return this._instance
    }

    /** 
     * 添加WebSocket并连接
     * @number socektID socektID(具有唯一性, 根据ID来操作socket)
     * @inter options usocket地址接口
     * @func callback2 接收数据回调函数
     * @func? callback2 连接成功回调函数
     */ 
    public setScoketNode(socektID: number, options: any, callback1: ReceiveFunc, callback2?:ConnectFunc): boolean {
        cc.log("ScoketNode: connect url: " + options.host)

        if (this._channels[socektID]) {
            cc.error('SocketManager: setScoketNode error: socektID  ' + socektID + "  already exists")
            return false
        }else {
            // socket处于连接中或者验证中
            if (this.state == ScoketStates.Connecting || this.state == ScoketStates.Checking) {
                cc.error("ScoketNode: connect to server error, state = " + this.state)
                return false
            }

            this._socketData = options
            this.curSocketID = socektID
            this._receiveFunc = callback1
            this._connectFunc = callback2
            this.state = ScoketStates.Connecting
            let socketObj: WebSocket = new WebSocket(options.host, options.protocol)
            socketObj.binaryType = "arraybuffer"
            socketObj.onopen = this.__onOpen.bind(this);
            socketObj.onmessage = this.__onMessage.bind(this);
            socketObj.onclose = this.__onClose.bind(this);
            socketObj.onerror = () => { cc.error("ScoketNode: connect error") }

            this._channels[socektID] = socketObj
            return false
        } 
    }

    /**
     * socket 连接成功回调处理, 验证鉴权
     */
    protected __onOpen() {
        // 如果设置了鉴权回调, 在连接完成后进入鉴权阶段, 等待鉴权结束
        if (this._certifiFunc !== null) {
            this.state = ScoketStates.Checking
            cc.log(`ScoketNode: onOpen status = ` + this.state)
            this._certifiFunc(() => { this.__onChecked() })
        } else {
            this.__onChecked()
        }
    }

    /** 
     * 连接验证成功, 进入工作状态
     */ 
    protected __onChecked() {
        this.state = ScoketStates.Working
        cc.log(`ScoketNode: onChecked status = ` + this.state)
        this._autoReconnect = 5

        if (null != this._connectFunc){
            this._connectFunc()
        }

        this._resetHearbeatTimer()
        // // 关闭连接或重连中的状态显示
        // this.updateNetTips(NetTipsType.Connecting, false);
        // this.updateNetTips(NetTipsType.ReConnecting, false);

        // // 重发待发送信息
        // console.log(`ScoketNode flush ${this.__requests.length} request`)
        // if (this.__requests.length > 0) {
        //     for (let i = 0; i < this.__requests.length;) {
        //         let req = this.__requests[i]
        //         this.__socket.send(req.buffer)
        //         if (req.rspObject == null || req.rspCmd <= 0) {
        //             this.__requests.splice(i, 1)
        //         } else {
        //             ++i
        //         }
        //     }
        //     // 如果还有等待返回的请求，启动网络请求层
        //     this.updateNetTips(NetTipsType.Requesting, this.request.length > 0);
        // }
    }

    /** 
     * socket接收回调
     * @any msg 接收到一个完整的消息包
     */ 
    protected __onMessage(msg: any): void {
        // 进行头部的校验（实际包长与头部长度是否匹配）
        // if (!this._protocolHelper.checkPackage(msg)) {
        //     console.error(`ScoketNode checkHead Error`);
        //     return;
        // }

        this._resetReceiveMsgTimer()
        // 消息分发
        this._receiveFunc(msg)
        
        // 触发消息执行
        // let rspCmd = this._protocolHelper.getPackageId(msg);
        // console.log(`ScoketNode onMessage rspCmd = ` + rspCmd);
        // 优先触发request队列
        // if (this.__requests.length > 0) {
        //     for (let reqIdx in this.__requests) {
        //         let req = this.__requests[reqIdx];
        //         if (req.rspCmd == rspCmd) {
        //             console.log(`ScoketNode execute request rspcmd ${rspCmd}`);
        //             // this._callbackExecuter(req.rspObject, msg);
        //             this.__requests.splice(parseInt(reqIdx), 1);
        //             break;
        //         }
        //     }
        //     console.log(`ScoketNode still has ${this.__requests.length} request watting`);
        //     if (this.__requests.length == 0) {
        //         this.updateNetTips(NetTipsType.Requesting, false);
        //     }
        // }

        // let listeners = this._listener[rspCmd];
        // if (null != listeners) {
        //     for (const rsp of listeners) {
        //         console.log(`ScoketNode execute listener cmd ${rspCmd}`);
        //         // this._callbackExecuter(rsp, msg);
        //     }
        // }
    }

    /** 
     * 接收socket关闭消息
     */ 
    protected __onClose() {
        this.state = ScoketStates.Closed
        cc.log(`ScoketNode: onChecked status = ` + this.state)
        this._clearTimer()

        // 自动重连
        if (this.isAutoReconnect()) {
            // this.updateNetTips(NetTipsType.ReConnecting, true);
            // this.autoReconnect(this.curSocketID)
        }
    }

    /** 
     * socket发送
     * @number socektID socektID(具有唯一性, 根据ID来操作socket)
     * @buffer buf 发送给服务器的buffer数据
     * @bool force
     */ 
    public send(buf: SocketData, force: boolean = false): boolean {
        // 检测websocket对象的readyState是否为OPEN, 是才进行send
        if (this.state == ScoketStates.Working || force) {
            this._channels[this.curSocketID].send(buf)
            return true
        } else if (this.state == ScoketStates.Checking || this.state == ScoketStates.Connecting) {
            this._requests.push({
                buffer: buf,
                rspCmd: 0,
                rspObject: null
            })
            cc.log("ScoketNode socket is busy, push to send buffer, current state is " + this.state);
            return true
        } else {
            cc.error("ScoketNode request error! current state is " + this.state);
            return false
        }
    }

    // // 发起请求，并在在结果返回时调用指定好的回调函数
    // public request(buf: SocketData, rspCmd: number, rspObject: inter_callbackObject, showTips: boolean = true, force: boolean = false, socektID: number = 0) {
    //     let node = this.__channels[socektID];
    //     if(node) {
    //         node.request(buf, rspCmd, rspObject, showTips, force);
    //     }
    // }

    // // 同request，但在request之前会先判断队列中是否已有rspCmd，如有重复的则直接返回
    // public requestUnique(buf: SocketData, rspCmd: number, rspObject: inter_callbackObject, showTips: boolean = true, force: boolean = false, socektID: number = 0): boolean {
    //     let node = this.__channels[socektID];
    //     if(node) {
    //         return node.requestUnique(buf, rspCmd, rspObject, showTips, force);
    //     }
    //     return false;
    // }

    /** 
     * 重置网络并进行连接
     * @number socektID socektID socektID(具有唯一性, 根据ID来操作socket)
     */ 
    public reSetAndLogin(socektID: number) {
        this.closeSocket(socektID)
        this.setScoketNode(socektID, this._socketData, this._receiveFunc)
    }

    /** 
     * 关闭网络
     * @number socektID socektID socektID(具有唯一性, 根据ID来操作socket)
     */ 
    public closeSocket(socektID: number) {
        this._clearTimer()
        // this._listener = {}
        // this._requests.length = 0
        // if (this._networkTips) {
        //     this._networkTips.connectTips(false);
        //     this._networkTips.reconnectTips(false);
        //     this._networkTips.requestTips(false);
        // }
        if (this._channels[socektID]) {
            this._channels[socektID].close()
            delete this._channels[socektID]
        } else {
            this.state = ScoketStates.Closed
        }
    }

    /********************** 心跳、超时相关处理 *********************/
    /** 
     * 接受到数据, 重新定时收数据计时器, 超过时间, 断开连接
     */ 
    private _resetReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }

        this._receiveMsgTimer = setInterval(() => {
            cc.warn("NetNode recvieMsgTimer close socket!")
            this.closeSocket(this.curSocketID)
        }, this._receiveTime)
    }

    /** 
     * 重置心跳包发送器
     */ 
    public _resetHearbeatTimer() {
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer)
        }

        this._keepAliveTimer = setInterval(() => {
            cc.log("SocketManager resetHearbeatTimer -> 发送心跳包")
            let buf = new BufManager()
            buf.create_netdata(0, 0, 1)
            buf.encryptBuffer()
            this.send(buf.send_bufferDataView.buffer)
        }, this._heartTime)
    }

    /** 
     * 清除定时器
     */ 
    private _clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer)
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer)
        }
    }

    /** 
     * 是否需要自动重连
     */ 
    public isAutoReconnect(): boolean {
        return this._autoReconnect != 0
    }

    /** 
     * 自动重连
     * @number socektID socektID socektID(具有唯一性, 根据ID来操作socket)
     */ 
    public autoReconnect(socektID: number): boolean {
        // 没有超过连接次数直接连接
        if (this._autoReconnect > 0){
            this._autoReconnect -= 1
            this.reSetAndLogin(socektID)
        }else {
            this._autoReconnect = 5
            ClientConfig.current_index += 1

            // 已经没有连接地址可用则直接提示连接失败
            if (ClientConfig.current_index > ClientConfig.total_count) {
                this.closeSocket(socektID)
                return true
            }

            if (null != ClientConfig.gameServer_list[ClientConfig.current_index]) {
                ClientConfig.socket_url = ClientConfig.gameServer_list[ClientConfig.current_index]
            }
            this.reSetAndLogin(socektID)
        }
    }
}