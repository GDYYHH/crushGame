import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"

/**
 * [layer] 注册账号界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class RegistLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_sure: cc.Button = null
    @property(cc.Node)
    node_inputOne: cc.Node = null
    @property(cc.Node)
    node_inputTwo: cc.Node = null


    phoneNum: string = ""
    code: string = ""
    password: string = ""
    passwordSure: string = ""


    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("RegistLayer")
        })

        this.btn_sure.node.on('click', () => {
            cc.log("确定注册账号")
        })


    }
}
