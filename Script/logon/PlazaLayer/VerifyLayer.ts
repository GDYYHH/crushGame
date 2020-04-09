import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"


/**
 * [layer] 修改密码界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class VerifyLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_sure: cc.Button = null
    @property(cc.Button)
    btn_send: cc.Button = null
    @property(cc.EditBox)
    edit_phone: cc.EditBox = null
    @property(cc.EditBox)
    edit_code: cc.EditBox = null
    @property(cc.EditBox)
    edit_password: cc.EditBox = null
    @property(cc.EditBox)
    edit_passwordSure: cc.EditBox = null

    @property(cc.Sprite)
    sp_title: cc.Sprite = null
    @property([cc.SpriteFrame])
    spFrame_title: cc.SpriteFrame[] = []

    //区分修改密码（1 是修改登录密码， 2 是修改保险箱密码）
    @property
    IndentifyCode: number = 0

    phoneNum: string = ""
    code: string = ""
    password: string = ""
    passwordSure: string = ""


    onLoad() {

        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("VerifyLayer")
        })

        this.btn_sure.node.on('click', () => {
            cc.log("确定修改登录密码")
        })

        this.btn_send.node.on('click', () => {
            cc.log("发送验证码")
        })

        this.edit_phone.node.on('text-changed', () => {
            this.phoneNum = this.edit_phone.string
            cc.log(this.phoneNum);
        })

        this.edit_code.node.on('text-changed', () => {
            this.code = this.edit_code.string
            cc.log(this.code);
        })

        this.edit_password.node.on('text-changed', () => {
            this.password = this.edit_password.string
            cc.log(this.password);
        })

        this.edit_passwordSure.node.on('text-changed', () => {
            this.passwordSure = this.edit_passwordSure.string
            cc.log(this.passwordSure);
        })

        if (this.IndentifyCode == 1) {
            cc.log("修改登录密码界面")
        }
        else {
            cc.log("修改保险箱密码界面")
        }
    }

    // 重载
    public initEjectUI() {
        this.IndentifyCode = this.typecode;

        this.sp_title.spriteFrame = this.spFrame_title[this.IndentifyCode - 1];

        this.node_mask = this.node.getChildByName("node_mask");
        this.node_layer = this.node.getChildByName("node_layer");
        this.node.active = true;
        this.node_layer.scale = 0.7;

    }


}
