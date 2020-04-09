/**
 * [scene] 登录场景和大厅场景消息处理类
 */
import { CMD_Logon } from "../CMD/Logon/CMD_Logon"
import { UIManager } from "../framework/ui/UIManager"
import { GameDefine } from "../framework/config/GameDefine"
import { GlobalUser } from "../framework/config/GlobalUser"
import { ClientConfig } from "../framework/config/ClientConfig"
import { BufManager } from "../framework/network/BufManager"
import { SocketManager } from "../framework/network/SocketManager"
import { UtilManager } from "../framework/common/UtilManager"
type connectCallBack = () => void
type viewCallBack = (statusID: number, bufferData?: any) => void

const { ccclass, property } = cc._decorator;

@ccclass
export class ClientNetControl extends cc.Component {

    public isLogonFail: boolean = false                                                   // 是否登录失败
    protected __viewCallBack: viewCallBack = null                                         // 场景注册回调函数

    // 设计成单例模式
    private static _instance: ClientNetControl = null
    public static GetInstance(): ClientNetControl {
        if (this._instance == null) {
            this._instance = new ClientNetControl()
        }
        return this._instance;
    }

    /**
     * 设置大厅连接的socket
     * @inter socketUrl socket地址
     * @number socektID socketID(具有唯一性, 大厅的socketID暂定为0)
     */
    public setSocket(socketUrl: any, socektID: number, connectCallBack: connectCallBack) {
        SocketManager.GetInstance().setScoketNode(socektID, socketUrl, (msgData: any) => {
            this.onSocketCallBack(msgData)
        }, connectCallBack)
    }

    /**
     * 场景注册回调
     * @any msgData socket数据
     */
    public setViewCallBack(viewCallBack: any) {
        if (this.__viewCallBack != viewCallBack && viewCallBack != null) {
            this.__viewCallBack = viewCallBack
        }
    }

    /**
     * 网络消息回调
     * @any msgData socket数据
     */
    public onSocketCallBack(msgData: any) {
        let buffer = new BufManager()
        let codeArray = buffer.decryptBuffer(msgData.data)
        let mainID: number = codeArray[0]                      // 主ID
        let subID: number = codeArray[1]                       // 子ID
        cc.log("clientNetControl onSocketCallBack:  " + mainID + "              " + subID)

        // 网络状态 0
        if (mainID === GameDefine.MAIN_SOCKET_INFO) {
            // 连接成功 1
            if (subID == GameDefine.SUB_SOCKET_CONNECT) {
                cc.log("收到心跳包")
                this.onConnectCompeleted()
                // this.popCacheMessage()
                // 连接失败 2
            } else if (subID == GameDefine.SUB_SOCKET_ERROR) {
                this.onConnecttError()
                // socket连接关闭 3
            } else {
                this.onCloseSocket()
            }
        } else {
            // 登录命令 100
            if (mainID === GameDefine.MDM_MB_LOGON) {
                this.onSubLogonEvent(subID, buffer)
                // 房间列表 101
            } else if (mainID === GameDefine.MDM_MB_SERVER_LIST) {
                this.onRoomListEvent(subID, buffer)
                // 用户服务 3
            } else if (mainID === GameDefine.MDM_GP_USER_SERVICE) {
                this.onSubUserService(subID, buffer)
                // 重新获取游戏列表 2
            } else if (mainID === GameDefine.MDM_GP_SERVER_LIST) {
                //     if sub == yl.SUB_GP_REFRESH_LIST then
                // 	--通知更新
                // 	local eventListener = cc.EventCustom:new(yl.UPDATE_MSG_GAMELIST)
                // 	cc.Director:getInstance():getEventDispatcher():dispatchEvent(eventListener)
                // elseif sub == yl.SUB_GP_LIST_NODE then
                // 	self:onSubListNode(sub, pData)
                // end
            }
        }
    }

    /**
     * socket连接成功回调
     */
    public onConnectCompeleted() {
        this.__viewCallBack(GameDefine.CONNECT_OK)
    }

    /**
     * socket连接失败回调
     */
    public onConnecttError() {
        let isFail: boolean = SocketManager.GetInstance().autoReconnect(0)
        if (isFail) {
            this.__viewCallBack(GameDefine.CONNECT_FAIL)
        }
    }

    /**
     * 登录回调(用户信息, 游戏列表)
     */
    public onSubLogonEvent(subID: number, buffer: BufManager) {
        if (subID == GameDefine.SUB_MB_LOGON_VERIFY_RESULT) {
            let cmd_data: any = buffer.read_netdata(CMD_Logon.CMD_MB_LogonVerifyResult)
            if (null != this.__viewCallBack) {
                this.__viewCallBack(subID, cmd_data)
            }
            // 登录成功读取用户信息
        } else if (subID == GameDefine.SUB_MB_LOGON_SUCCESS) {
            cc.log("clientNetControl onSubLogonEvent: 登陆成功===================>>")
            this.isLogonFail = false
            // GlobalUserItem.szMachine = self._szMachine
            // GlobalUserItem.szIpAdress = self._szClientIP
            GlobalUser.setCacheData(buffer)
            // if self._szAccount==nil then
            //     self._szAccount=GlobalUserItem.szAccount
            //     self._szPassword=GlobalUserItem.szPassword
            // end
            // --重置房间
            // GlobalUserItem.roomlist = {}
            // self._tempAllRoom = {}
            // 登录失败
        } else if (subID == GameDefine.SUB_MB_LOGON_FAILURE) {
            cc.log("clientNetControl onSubLogonEvent: 登陆失败===================>>")
            this.isLogonFail = true
            let cmd_data: any = buffer.read_netdata(CMD_Logon.CMD_MB_LogonFailure)
            if (null != this.__viewCallBack) {
                this.__viewCallBack(GameDefine.INVALID_LOGIN, cmd_data)
            }
            UIManager.GetInstance().showToast(cmd_data.szDescribeString, 1)
            // cc.UserDefault:getInstance():setBoolForKey("hadEnterGame",false)
            // SocketManager.GetInstance().reSetAndLogin(ClientConfig.socket_id)
        }
    }

    /**
     * 房间信息
     * @number subID 子ID
     * @any buffer socket数据
     */
    public onRoomListEvent(subID: number, buffer: any) {
        // 接收列表数据完成 200
        if (subID == GameDefine.SUB_MB_LIST_FINISH) {
            //         self.isAgine = false

            //         if self._logonMode == 0 then --账号登录 or 手机登录
            //             GlobalUserItem.szAccount = self._szAccount
            //             GlobalUserItem.szPassword = self._szPassword
            //             GlobalUserItem.bVistor 	 = false
            //             GlobalUserItem.bWeChat = false
            //         elseif self._logonMode == 1 then --注册
            //             GlobalUserItem.szAccount = self._szRegAccount
            //             GlobalUserItem.szPassword = self._szRegPassword
            //             GlobalUserItem.bVistor 	 = false
            //             GlobalUserItem.bWeChat = false
            //         elseif self._logonMode == 2 then 						--游客登录
            //             GlobalUserItem.bVistor  = true
            //             GlobalUserItem.bWeChat = false
            //         elseif self._logonMode == 3 then 						--微信登陆
            //             GlobalUserItem.bVistor  = false
            //             GlobalUserItem.bWeChat = true
            //         end

            //         -- 整理列表
            //         for k,v in pairs(self._tempAllRoom) do
            //             table.sort(v, function(a, b)
            //                 return a.wSortID < b.wSortID
            //             end)
            //             for i = 1, #v do
            //                 v[i]._nRoomIndex = i
            //             end
            //             local roomlist = {}
            //             table.insert(roomlist,k)
            //             table.insert(roomlist,v)
            //             --加入缓存
            //             table.insert(GlobalUserItem.roomlist,roomlist)
            //         end

            if (null != this.__viewCallBack) {
                this.__viewCallBack(GameDefine.SUCCESS_LOGIN)
            }

            //     elseif sub == yl.SUB_MB_LIST_SERVER then	--列表数据 101
            //         self:onSubRoomListInfo(pData)
            //     elseif sub == yl.SUB_MB_LIST_KIND then	    --列表数据 100
            //         performWithDelay(self, function( ... )
            //             if self.isAgine then
            //                 if not self.isIosLogon  then
            //                     self.isIosLogon = true

            //                     if self._logonMode == 0 then --账号登录 or 手机登录
            //                         GlobalUserItem.szAccount = self._szAccount
            //                         GlobalUserItem.szPassword = self._szPassword
            //                         GlobalUserItem.bVistor 	 = false
            //                         GlobalUserItem.bWeChat = false
            //                     elseif self._logonMode == 1 then --注册
            //                         GlobalUserItem.szAccount = self._szRegAccount
            //                         GlobalUserItem.szPassword = self._szRegPassword
            //                         GlobalUserItem.bVistor 	 = false
            //                         GlobalUserItem.bWeChat = false
            //                     elseif self._logonMode == 2 then 						--游客登录
            //                         GlobalUserItem.bVistor  = true
            //                         GlobalUserItem.bWeChat = false
            //                     elseif self._logonMode == 3 then 						--微信登陆
            //                         GlobalUserItem.bVistor  = false
            //                         GlobalUserItem.bWeChat = true
            //                     end

            //                     local LogonData = CCmd_Data:create(239)
            //                     LogonData:setcmdinfo(2, 2)
            //                     self:sendSocketData(LogonData)
            //                 end	
            //             end
            //         end, 2)
            //     end
            // end
        }
    }

    /**
     * 用户数据
     * @number subID 子ID
     * @any buffer socket数据
     */
    public onSubUserService(subID: number, buffer: any) {
        // 银行成功
        if (subID == GameDefine.SUB_GP_USER_INSURE_SUCCESS) {

        }
        // 银行失败
        else if (subID == GameDefine.SUB_GP_USER_INSURE_FAILURE) {

        }
        // 开通银行结果
        else if (subID == GameDefine.SUB_GP_USER_INSURE_ENABLE_RESULT) {

        }
        // 领取低保结果
        else if (subID == GameDefine.SUB_GP_BASEENSURE_RESULT) {

        }
        // 充值成功
        else if (subID == GameDefine.SUB_MB_RECHARGESUCCESS) {

        }
        // 新邮件提醒
        else if (subID == GameDefine.SUB_MB_NOTIFYIDNEWMAIL) {

        }
        // 存款结果
        else if (subID == GameDefine.SUB_GP_USER_SAVE_RESULT) {

        }
        // 取款结果
        else if (subID == GameDefine.SUB_GP_USER_TAKE_RESULT) {

        }
        // 游戏推送
        else if (subID == GameDefine.SUB_MB_RADIO_MESSAGE) {

        }
        // 充值结果
        else if (subID == GameDefine.SUB_GP_ADD_RECHARGE_ORDER_RESULT) {

        }
        // 打码量返水结果
        else if (subID == GameDefine.SUB_GP_TAKE_SCORE_BY_REBATE_RESULT) {

        }
        // 签到结果
        else if (subID == GameDefine.SUB_GP_TAKE_SCORE_BY_ATTENDANCE_RESULT) {

        }
        // 绑定手机结果
        else if (subID == GameDefine.SUB_GP_USER_BIND_MOBILE_RESULT) {

        }
        // 绑定银行卡结果
        else if (subID == GameDefine.SUB_GP_USER_ADD_BANKCARD_RESULT) {

        }
        // 兑换结果
        else if (subID == GameDefine.SUB_GP_EXCHANGESCORE_RESULT) {

        }
        // 提现限制
        else if (subID == GameDefine.SUB_GP_USER_QUERY_SCORE_RESULT) {

        }
        // 客服消息推送
        else if (subID == GameDefine.SUB_MB_CUSTOMER) {

        }
        // 修改昵称结果
        else if (subID == GameDefine.SUB_GP_INDIVIDUAL_RESULT) {
            let cmd_data: any = buffer.read_netdata(CMD_Logon.CMD_GP_INDIVIDUAL_RESULT)
            if (null != this.__viewCallBack) {
                this.__viewCallBack(subID, cmd_data)
            }
        }
        // 修改头像结果
        else if (subID == GameDefine.SUB_GP_USER_FACE_INFO) {
            let cmd_data: any = buffer.read_netdata(CMD_Logon.CMD_GP_UserFaceInfo)
            if (null != this.__viewCallBack) {
                this.__viewCallBack(subID, cmd_data)
            }
        }
        // 加载任务
        else if (subID == GameDefine.SUB_GP_TASK_INFO) {

        }
        // 任务结果
        else if (subID == GameDefine.SUB_GP_TASK_RESULT) {

        }
        // 轮盘配置
        else if (subID == GameDefine.SUB_GP_LOTTERY_USER_INFO) {

        }
        // 奖项配置
        else if (subID == GameDefine.SUB_GP_LOTTERY_CONFIG) {

        }
        // 抽奖记录
        else if (subID == GameDefine.SUB_GP_LOTTERY_RECORD) {

        }
        // 抽奖结果
        else if (subID == GameDefine.SUB_GP_LOTTERY_RESULT) {

        }
        // 兑换码兑换结果
        else if (subID == GameDefine.SUB_GP_TAKE_SCORE_BY_REDEEMCODE_RESULT) {

        }
        // 领取红包结果
        else if (subID == GameDefine.SUB_GP_RED_PACKER_RESULT) {

        }
        // 红包记录
        else if (subID == GameDefine.SUB_GP_RED_RECORD_RESULT) {

        }
        // 所有红包消息
        else if (subID == GameDefine.SUB_GP_RED_INFO) {

        }
        // 收到红包消息
        else if (subID == GameDefine.SUB_MB_REDPACKETNOTICE) {

        }
        // 强退用户刷新金币
        else if (subID == GameDefine.SUB_MB_USERHALLSCORE) {

        }
        // 奖池变动
        else if (subID == GameDefine.SUB_MB_JACKPOTCHANGE) {

        }
        // 全局在线通知
        else if (subID == GameDefine.SUB_MB_SYSTEMUPDATE) {

        }
        // 别处登录通知
        else if (subID == GameDefine.SUB_MB_OTHERLOGIN) {

        }
        // 操作成功
        else if (subID == GameDefine.SUB_GP_OPERATE_SUCCESS) {

        }
        // 操作失败
        else if (subID == GameDefine.SUB_GP_OPERATE_FAILURE) {

        }
        // 更新系统消息跑马灯
        else if (subID == GameDefine.SUB_MB_SYSTEM_RADIO_MESSAGE) {

        }
        // 未知消息号
        else {
            cc.log("未知消息号-------", subID)
        }
    }

    /**
     * socket网络关闭
     */
    public onCloseSocket() {
        SocketManager.GetInstance().closeSocket(0)
    }

    /**
     * 处理缓存未发送消息
     */
    public popCacheMessage() {
        // --处理未发送的缓存数据
        // for k,v in pairs(self.m_sendCache) do
        //     if self:sendSocketData(v) then
        //         v:release()
        //         self.m_sendCache[k] = nil
        //     end
        // end
    }

    /*******************************************************    消息发送     **************************************************************** */
    /**
     * 账号注册
     */
    public send_registerAccounts(account: string, pwd: string) {
        let buf = new BufManager()
        buf.create_netdata(CMD_Logon.CMD_MB_RegisterAccounts, GameDefine.MDM_MB_LOGON, GameDefine.SUB_MB_LOGON_ACCOUNTS)
        buf.pushWord(GameDefine.INVALID_WORD)                                                 // 模块标识
        buf.pushDword(101122049)                                                              // 广场版本
        buf.pushByte(1)                                                                       // 设备类型
        buf.pushString(UtilManager.md5(pwd), GameDefine.LEN_THIRTYTHREE)		                      //登陆密码
        buf.pushWord(1)														                  // 头像标识
        buf.pushByte(0)										                                  // 用户性别
        buf.pushString(account, GameDefine.LEN_THIRTYTWO)						              // 登陆账号
        buf.pushString(account, GameDefine.LEN_THIRTYTWO)					                  // 用户昵称
        buf.pushDword(0)								                                      // 推荐标识

        buf.pushString('A501164B345DCFC0E2afasf63Cdgdd646', GameDefine.LEN_THIRTYTHREE)		  // 机器标识
        buf.pushString('192.168.100.103', GameDefine.LEN_THIRTYTWO)					          // 客户端IP
        buf.pushString(account, GameDefine.LEN_MOBILE_PHONE)				                  // 注册手机号码-当账号用

        buf.pushWord(ClientConfig.operator_ID)                                                // 运营商编号
        buf.pushWord(ClientConfig.channel_ID)                                                 // 渠道编号

        buf.pushString('', GameDefine.LEN_COMPELLATION)	                                      //真实名字
        buf.pushString('', GameDefine.LEN_THIRTYTHREE)	                                          //邮箱
        buf.pushString('', GameDefine.LEN_COMPELLATION)	                                      //QQ号
        buf.pushString('', GameDefine.LEN_THIRTYTHREE)	                                          //微信号
        buf.pushString('', GameDefine.LEN_MOBILE_PHONE)                                       //电话号码
        buf.pushString('', GameDefine.LEN_VERIF_CODE)	                                      //注册验证码                         
        buf.pushString('', GameDefine.LEN_THIRTYTWO)	                                          //代理标识

        buf.encryptBuffer()
        SocketManager.GetInstance().send(buf.send_bufferDataView.buffer)
    }

    /**
     * 账号登录
     */
    public send_accounts(account: string, pwd: string) {
        let buf = new BufManager()
        buf.create_netdata(CMD_Logon.CMD_MB_LoginAccounts, GameDefine.MDM_MB_LOGON, GameDefine.SUB_MB_LOGON_ACCOUNTS)
        buf.pushWord(GameDefine.INVALID_WORD)                                                 // 模块标识
        buf.pushDword(101122049)                                                              // 广场版本
        buf.pushByte(1)                                                                       // 设备类型
        buf.pushString(UtilManager.md5(pwd), GameDefine.LEN_THIRTYTHREE)		                      // 登陆密码
        buf.pushString(account, GameDefine.LEN_THIRTYTWO)						              // 登陆账号
        buf.pushString('A501164B345DCFC0E2afasf63Cdgdd646', GameDefine.LEN_THIRTYTHREE)		  // 机器标识
        buf.pushString('192.168.100.103', GameDefine.LEN_THIRTYTWO)					          // 客户端IP
        buf.pushString(account, GameDefine.LEN_MOBILE_PHONE)				                  // 注册手机号码

        buf.pushWord(ClientConfig.operator_ID)                                                // 运营商编号
        buf.pushWord(ClientConfig.channel_ID)                                                 // 渠道编号

        buf.encryptBuffer()
        SocketManager.GetInstance().send(buf.send_bufferDataView.buffer)
    }

    /**
     * 游客登录
     */
    public send_visitor() {
        let buf = new BufManager()
        buf.create_netdata(CMD_Logon.CMD_MB_LogonVisitor, 100, 5)
        buf.pushWord(GameDefine.INVALID_WORD)                                                 // 模块标识
        buf.pushDword(101122049)                                                              // 广场版本
        buf.pushByte(1)                                                                       // 设备类型
        buf.pushString('A501164B345DCFC0E2afasf63Cdgdd678', 33)                               // 机器标识
        buf.pushString('192.168.1.2', 32)                                                     // 客户端IP
        buf.pushWord(ClientConfig.operator_ID)                                                // 运营商编号
        buf.pushWord(ClientConfig.channel_ID)                                                 // 渠道编号

        buf.pushString('', 16)                              // 机器标识
        buf.pushString('', 33)                                                     // 客户端IP
        buf.pushString('', 16)                              // 机器标识
        buf.pushString('', 33)                                                     // 客户端IP
        buf.pushString('', 12)                              // 机器标识
        buf.pushString('', 8)                                                     // 客户端IP
        buf.pushString('', 32)                              // 机器标识

        buf.encryptBuffer()
        SocketManager.GetInstance().send(buf.send_bufferDataView.buffer)
    }

    /**
     * 修改昵称
     */
    public send_modifyUserInfo(szNickname: string) {
        let buf = new BufManager()
        buf.create(134, GameDefine.MDM_GP_USER_SERVICE, GameDefine.SUB_GP_MODIFY_INDIVIDUAL)
        buf.pushDword(GlobalUser.user_userID)                                                       // 模块标识
        buf.pushString(GlobalUser.user_dynamicPass, GameDefine.LEN_THIRTYTHREE)                     // 用户动态密码
        buf.pushString(szNickname, GameDefine.LEN_THIRTYTWO)                                        // 昵称

        buf.encryptBuffer()
        SocketManager.GetInstance().send(buf.send_bufferDataView.buffer)
    }

    /**
     * 修改头像
     * @number faceId 系统头像Id
     */
    public send_modifySystemHead(faceId: number) {
        let buf = new BufManager()
        buf.create_netdata(CMD_Logon.CMD_GP_SystemFaceInfo, GameDefine.MDM_GP_USER_SERVICE, GameDefine.SUB_GP_SYSTEM_FACE_INFO)
        buf.pushWord(faceId)                                                                         // 头像id
        buf.pushDword(GlobalUser.user_userID)                                                        // 用户id
        buf.pushString(UtilManager.md5(GlobalUser.user_password), GameDefine.LEN_THIRTYTHREE)        // 用户密码
        buf.pushString('A501164B345DCFC0E2afasf63Cdgdd646', GameDefine.LEN_THIRTYTHREE)              // 机器序列

        buf.encryptBuffer()
        SocketManager.GetInstance().send(buf.send_bufferDataView.buffer)
    }
    /*******************************************************    消息接收     **************************************************************** */
}