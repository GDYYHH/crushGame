
import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer";

/**
 * [layer] 签到界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class RegisterLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_bind: cc.Button = null


    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("RegisterLayer")
        })
        this.btn_bind.node.on('click', () => {
            UIManager.GetInstance().hide("RegisterLayer")
            UIManager.GetInstance().show("VerifyLayer", 3)
        })
    }

    start() {

    }

    // update (dt) {}
}
