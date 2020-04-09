/**
 * [layer] 战绩界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { HttpManager } from "../../framework/network/HttpManager"

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordLayer extends cc.Component {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面
    @property(cc.Node)
    node_recordItem: cc.Node = null  //游戏记录子节点
    @property(cc.ScrollView)
    scrollView_record: cc.ScrollView = null  //游戏记录列表

    rect_recordView = null

    onLoad() {
        this.requestGameRecordList()
        this.getScrollViewRect()

        this.btn_close.node.on('click', () => {
            // UIManager.GetInstance().hide("")
            this.node.destroy()
        })

        this.framingLoad(50)

    }

    start() {

    }

    onEnable() {
        this.scrollView_record.node.on("scrolling", this.onScrollingBackCall, this);
    }

    onDisable() {
        this.scrollView_record.node.off("scrolling", this.onScrollingBackCall, this);
    }

    /**
     * 分帧加载
     * @param length 
     */
    async framingLoad(length: number) {
        await this.executePreFrame(this.getItemGenerator(length), 1);
    }

    /**
     * 处理分帧加载
     * @param generator 
     * @param duration 
     */
    private executePreFrame(generator: Generator, duration: number) {
        return new Promise((resolve, reject) => {
            let gen = generator;
            // 创建执行函数
            let execute = () => {

                // 执行之前，先记录开始时间戳
                let startTime = new Date().getTime();

                // 然后一直从 Generator 中获取已经拆分好的代码段出来执行
                for (let iter = gen.next(); ; iter = gen.next()) {

                    // 判断是否已经执行完所有 Generator 的小代码段，如果是的话，那么就表示任务完成
                    if (iter == null || iter.done) {
                        resolve();
                        return;
                    }

                    // 每执行完一段小代码段，都检查一下是否已经超过分配给本帧，这些小代码端的最大可执行时间
                    if (new Date().getTime() - startTime > duration) {

                        // 如果超过了，那么本帧就不在执行，开定时器，让下一帧再执行
                        this.scheduleOnce(() => {
                            execute();
                        });
                        return;
                    }
                }
            };

            // 运行执行函数
            execute();
        });
    }

    /**
     * 获取生成子节点的Generator
     * @param length 需要加载的子节点的个数
     */
    public *getItemGenerator(length: number) {
        for (let index = 0; index < length; index++) {
            yield this.initRecordItem(index)
        }
    }

    /**
     * 初始化游戏记录的子节点
     * @param itemIndex 节点的下标
     */
    public initRecordItem(itemIndex: number) {
        let item = cc.instantiate(this.node_recordItem);
        item.active = true
        item.parent = this.scrollView_record.content;
        item.setPosition(0, 0);
    }

    /**
     * 滑动游戏列表的回调
     */
    private onScrollingBackCall() {
        if (this.scrollView_record.content.childrenCount == 0) {
            return;
        }

        this.scrollView_record.content.children.forEach((childNode: cc.Node) => {
            if (childNode.getBoundingBoxToWorld().intersects(this.rect_recordView)) {
                if (childNode.opacity != 255) {
                    childNode.opacity = 255;
                }
            }
            else {
                if (childNode.opacity != 0) {
                    childNode.opacity = 0;
                }
            }
        });
    }

    /**
     * 获取滑动条的区域大小
     */
    public getScrollViewRect() {
        let scrollview = this.scrollView_record
        let svLeftBottomPoint = scrollview.node.parent.convertToWorldSpaceAR(
            cc.v2(
                scrollview.node.x - scrollview.node.anchorX * scrollview.node.width,
                scrollview.node.y - scrollview.node.anchorY * scrollview.node.height
            )
        )
        let svBoxRect: cc.Rect = cc.rect(
            svLeftBottomPoint.x,
            svLeftBottomPoint.y,
            scrollview.node.width,
            scrollview.node.height
        )
        this.rect_recordView = svBoxRect
    }

    /**
     * 请求游戏记录列表
     */
    public requestGameRecordList() {

        let self = this
        let callBackGameTaskList = function (isSucc, taskList: {}) {
            if (isSucc) {
                let data = taskList["list"]
            }
            else {
                cc.log("获取游戏记录列表失败")
            }
        }
        // HttpManager.GetInstance().sendHttp_GameRecordList(callBackGameTaskList)
    }


}
