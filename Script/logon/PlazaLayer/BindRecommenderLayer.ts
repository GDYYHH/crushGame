import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"

/**
 * [layer] 绑定推荐人界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class BindRecommenderLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null
    @property(cc.Button)
    btn_bind: cc.Button = null


    onLoad() {
        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("BindRecommenderLayer")
        })
        this.btn_bind.node.on('click', () => {
        })
    }

    start() {

    }

    // update (dt) {}
}
