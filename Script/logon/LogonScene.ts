/**
 * [scene] 登录场景
 */
import { ClientNetControl } from "./ClientNetControl"
import { HttpManager } from "../framework/network/HttpManager"
import { PlatformManager } from "../framework/common/PlatformManager"
import { ClientConfig } from "../framework/config/ClientConfig"
import { GameDefine } from "../framework/config/GameDefine"
import { GlobalUser } from "../framework/config/GlobalUser"
import { UIManager } from "../framework/ui/UIManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class LogonScene extends cc.Component {
    @property(cc.Button)
    btn_homeWeb: cc.Button = null
    @property(cc.Button)
    btn_wechat: cc.Button = null
    @property(cc.Button)
    btn_account: cc.Button = null
    @property(cc.Button)
    btn_visitor: cc.Button = null
    @property(cc.Label)
    t_account: cc.Label = null

    public _keepAliveTimer: any

    public onLoad() {
        // let a = jsb.FileUtils
        // 获取设备类型
        let deviceTypeID: string = cc.sys.os
        // 请求后台服务器, 获取游戏初始化数据
        HttpManager.GetInstance().sendHttp(ClientConfig.http_Requst, 'route=Init&TypeID=' + deviceTypeID, 'GET', (params: any) => {
            let succeed: boolean = false
            let msg: string = "网络获取失败！"

            if (params && params['Valid'] === true) {
                let databuffer = params["data"]
                if (databuffer) {
                    // 返回结果
                    succeed = databuffer["valid"]
                    // 获取信息
                    if (succeed === true) {
                        // 设置后台数据
                        ClientConfig.serverConfig = databuffer
                        // 设置网关
                        ClientConfig.gameServer_list = databuffer["gatelist"]
                        ClientConfig.netServer_list = databuffer["http_api"]
                        ClientConfig.setGateway()
                        // 设置七日年化率
                        ClientConfig.bankRate = databuffer["bankRate"]
                        // 设置客服url
                        // ClientConfig.keFuUrl = databuffer["customer_url"]
                        // 设置运营商ID
                        ClientConfig.operator_ID = databuffer["operatorID"]
                        // 设置渠道ID
                        ClientConfig.channel_ID = databuffer["channelID"]
                        // 初始化更新
                        // this:initClientUpdate(databuffer["resversion"])
                        // 初始化游戏列表
                        this.initGameList(databuffer["gamelist"])

                        // 注册socekt消息回调
                        ClientNetControl.GetInstance().setViewCallBack((statusID: number, bufferData?: any) => {
                            this.setViewBack(statusID, bufferData)
                        })
                    }
                }
            }
        })

        // 打开官网主页
        this.btn_homeWeb.node.on('click', () => {
            cc.sys.openURL('https://www.baidu.com/')
        })

        // 游客登录
        this.btn_visitor.node.on('click', () => {
            ClientNetControl.GetInstance().setSocket(ClientConfig.connectOptions, ClientConfig.socket_id, () => {
                // 游客登录
                GlobalUser.operate_ID = 2
                ClientNetControl.GetInstance().send_visitor()
            })
        })

        // 账号登录
        this.btn_account.node.on('click', () => {
            UIManager.GetInstance().show("LoginLayer")
        })
    }

    // 初始化游戏列表
    public initGameList(data: object) {
        for (let key in data) {
            let val: object = data[key]
            let gameinfo = {}
            gameinfo['_KindID'] = val["KindID"]
            gameinfo['gameid'] = parseInt(val["KindID"])
            gameinfo['status'] = parseInt(val["Nullity"])
            gameinfo['_GameName'] = val["KindName"]
            gameinfo['_KindName'] = val["ModuleName"].toLowerCase() + "."
            gameinfo['_Module'] = gameinfo['_KindName'].replace("[.]", "/")
            gameinfo['_KindVersion'] = val["ClientVersion"]
            gameinfo['_ServerResVersion'] = parseInt(val["ResVersion"])
            gameinfo['_Type'] = "download"
            gameinfo['_GameFlag'] = parseInt(val["GameFlag"])

            gameinfo['roomls'] = GlobalUser.getGameRoom(val["_KindID"])
            gameinfo['gametypes'] = GlobalUser.getGameRoom(val["_KindID"])

            if (gameinfo['status'] === 0) {
                ClientConfig.game_list.push(gameinfo)
            }

            //         --检查本地文件是否存在
            //         local path = device.writablePath .. gameinfo._Module
            //         gameinfo._Active = cc.FileUtils:getInstance():isDirectoryExist(path)
            //         local isPlace = string.find(gameinfo._KindName, "[.]")
            //         if isPlace then
            //             gameinfo._Type = string.sub(gameinfo._KindName,1,isPlace - 1)
            //         end
        }
    }

    public setViewBack(subID: number, bufferData?: any) {
        cc.log("LogonScene setViewBack subID: ", subID)
        if (subID === GameDefine.CONNECT_OK) {
            // 不是第一次进入游戏
            // if cc.UserDefault:getInstance():getBoolForKey("hadEnterGame", false) then
            //     self:autoLogin()
            // end
            return
        }

        if (subID === GameDefine.CONNECT_FAIL) {
            // QueryExit:create("连接服务器失败!是否重试？",function(bReTry)
            // if bReTry == true then
            // 	if cc.UserDefault:getInstance():getBoolForKey("hadEnterGame", false) then
            // 		self:autoLogin()
            // 	end
            // end
            // end)
            // :addTo(self)
            // self:setLoginViewVisible(true)
            return
        }

        // 登录成功
        if (subID === GameDefine.SUCCESS_LOGIN) {
            let user_mobile: string = GlobalUser.user_mobile
            if ((null != user_mobile && "" != user_mobile) || (GlobalUser.is_vistor == true)) {
                this.loginSuccess()
            }
        }
    }

    // 登录成功
    public loginSuccess() {
        // 设置游客登录的默认数据
        if (GlobalUser.operate_ID === 2) {
            GlobalUser.vistor_password = "ZZYKKK@#$222"
            GlobalUser.is_vistor = true
        }

        // 保存登录信息(wait..)
        // GlobalUser.onSaveAccountConfig()

        cc.log(ClientConfig.game_list, "开通的游戏列表")
        // 进入大厅
        this.enterClient()
    }

    // 进入大厅
    public enterClient() {
        cc.director.loadScene("PlazaScene")
    }

    public start() {
        UIManager.GetInstance().init(this, "login")
        cc.director.preloadScene("PlazaScene", function () {
            // cc.log("预加载主场景")
        })
    }
}
