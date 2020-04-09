/*
*   laidongwei
*   2020/3/23
*/

import { GameDefine } from "../config/GameDefine";

// Come滑入layer  Scale缩放layer Toastlayer Tips提示layer Error错误layer
export enum LayerType {
    Come = 1,
    Scale = 2,
    Toast = 3,
    Dialog = 4,
    Error = 5,
}

const { ccclass, property } = cc._decorator;

@ccclass
export class BaseLayer extends cc.Component {
    @property({ type: cc.Enum(LayerType) })
    layerType: LayerType = LayerType.Come
    @property(cc.Boolean)
    showMask: boolean = true

    protected _root: cc.Node = null
    protected _scene: any = null
    public typecode: number = 1

    public node_mask: cc.Node = null
    public node_layer: cc.Node = null

    public onLoad() {
        this._root = cc.find("Common");
    }

    // 初始化面板相关属性
    public init(_scene?: any, typecode?: number) {
        this._scene = _scene;
        this._root = this._scene.node ? this._scene.node : this._root;
        this.typecode = typecode >= 1 ? typecode : 1;
        switch (this.layerType) {
            case LayerType.Come:
                this.initComeUI();
                break;
            case LayerType.Scale:
            case LayerType.Dialog:
                this.initEjectUI();
                break;
            case LayerType.Toast:
                this.initToastUI();
                break;
            default:
                break;
        }
        this.node.parent = this._root;
    }

    // 初始化come
    public initComeUI() {
        this.node.active = false;
        this.node.x = GameDefine.DESIGN_WIDTH;
    }

    // 初始化弹出层
    public initEjectUI() {
        this.node_mask = this.node.getChildByName("node_mask");
        this.node_layer = this.node.getChildByName("node_layer");
        this.node_mask.active = this.showMask;
        this.node.active = true;
        this.node_layer.scale = 0.7;
    }

    //初始化Toast
    public initToastUI() {
        this.node.active = true;
    }

    // 打开动作
    private open() {
        let action = cc.scaleTo(0.5, 1, 1).easing(cc.easeElasticOut(0.5))
        this.node_layer.runAction(action)
    }

    // 关闭动作
    private close() {
        let action = cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
            this.node.opacity = 255;
            this.node.active = false;
        }))
        this.node.runAction(action);
    }

    // 滑入动作
    private come() {
        let action = cc.moveTo(0.2, 0, 0);
        this.node.runAction(action);
    }

    // 滑出动作
    private out() {
        let action = cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
            this.node.x = GameDefine.DESIGN_HEIGTH;
            this.node.opacity = 255;
            this.node.active = false;
        }))
        this.node.runAction(action);
    }

    // 显示
    public show() {
        cc.log("view type is " + this.layerType)
        this.node.active = true;
        this.node.stopAllActions()
        switch (this.layerType) {
            case LayerType.Come:
                this._scene.changeArea(false)
                this.come()
                break;
            case LayerType.Scale:
                this.open()
                break;
            default:
                break;
        }
    }

    //隐藏
    public hide() {
        this.typecode = 1
        this.node.stopAllActions()
        switch (this.layerType) {
            case LayerType.Come:
                this._scene.changeArea(true)
                this.out()
                break;
            case LayerType.Scale:
            case LayerType.Dialog:
                this.close()
                break;
            default:
                break;
        }
    }

    //Toast
    public showToast(text: string, delay: number, color?: cc.Color) { }

    //QueryDialog
    public showQueryDialog(text: string, callback: Function, cancelShow: boolean, confirmName?: string, cancelName?: string) { }
}