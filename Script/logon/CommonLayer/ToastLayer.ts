/**
 * [layer] Toast界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { PoolManager } from "../../framework/common/PoolManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastLayer extends BaseLayer {
    @property([cc.Prefab])
    per_tips: cc.Prefab[] = []
    @property(cc.Node)
    node_content: cc.Node = null

    public onLoad() {
        PoolManager.GetInstance().initEnemy(this.per_tips, 10)
    }

    public onDisable() {
        let poolNode = PoolManager.GetInstance().createEnemy(this.per_tips[0], this.node_content);
        PoolManager.GetInstance().clearEnemy(poolNode)
    }

    //public update(dt) {
    //}

    //Toast
    public showToast(text: string, delay: number, color?: cc.Color): void {
        delay = delay || 3;
        color = color || cc.color(255, 255, 255);
        let node = PoolManager.GetInstance().createEnemy(this.per_tips[0], this.node_content);
        node.color = color;
        node.opacity = 0;
        let label = node.getChildByName("t_tip").getComponent(cc.Label);
        label.string = text;

        let action = cc.sequence(cc.fadeIn(0.2), cc.delayTime(delay), cc.callFunc(() => {
            PoolManager.GetInstance().killEnemy(node);
            node.removeFromParent()
            let childrenCount = this.node_content.childrenCount;
            if (childrenCount == 0) {
                UIManager.GetInstance().delete(UIManager.ToastName)
                this.node.destroy();
            }

        }))
        node.stopAllActions();
        node.runAction(action);
    }

}
