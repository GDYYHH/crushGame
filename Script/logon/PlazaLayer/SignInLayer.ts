import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"


/**
 * [layer] 签到界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class SignInLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_blank: cc.Button = null


    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("SignInLayer")
        })
        this.btn_blank.node.on('click', () => {
        })
    }

    start() {

    }

    // update (dt) {}
}
