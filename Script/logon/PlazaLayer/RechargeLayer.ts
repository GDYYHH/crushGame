import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"

/**
 * [layer] 充值界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null


    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("RechargeLayer")
        })
    }

    start() {

    }

    // update (dt) {}
}
