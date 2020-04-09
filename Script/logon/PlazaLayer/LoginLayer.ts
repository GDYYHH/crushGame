import { UIManager } from "../../framework/ui/UIManager";
import { GlobalUser } from "../../framework/config/GlobalUser";
import { ClientNetControl } from "../ClientNetControl";
import { BaseLayer } from "../../framework/ui/BaseLayer";
import { ClientConfig } from "../../framework/config/ClientConfig";

/**
 * [layer] 签到界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginLayer extends BaseLayer {
    @property(cc.Button)
    btn_forget: cc.Button = null
    @property(cc.Button)
    btn_regist: cc.Button = null
    @property(cc.Button)
    btn_login: cc.Button = null
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.EditBox)
    edit_account: cc.EditBox = null
    @property(cc.EditBox)
    edit_password: cc.EditBox = null

    public onLoad() {
        this.btn_forget.node.on('click', () => {
        })
        this.btn_regist.node.on('click', () => {
        })
        this.btn_login.node.on('click', () => {
            this.login()
        })
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("LoginLayer")
        })
    }

    public start() {

    }

    //登陆
    private login() {
        let account = this.edit_account.string
        let pwd = this.edit_password.string
        if (account == "") {
            UIManager.GetInstance().showToast("游戏账号为您注册的手机号码", 2)
            return
        }
        if (pwd == "") {
            UIManager.GetInstance().showToast("请填写您的账号密码", 2)
            return
        }

        ClientNetControl.GetInstance().setSocket(ClientConfig.connectOptions, ClientConfig.socket_id, () => {
            // 账号登录
            GlobalUser.operate_ID = 0
            ClientNetControl.GetInstance().send_accounts(account, pwd)
        })

    }

}
