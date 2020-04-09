/*
*   工具类
*   2020/3/17
*/

import { MD5 } from "./MD5"

const { ccclass, property } = cc._decorator

@ccclass
export class UtilManager extends cc.Component {

    // 设计成单例模式
    private static Instance: UtilManager = null;
    public static GetInstance(): UtilManager {
        if (this.Instance == null) {
            this.Instance = new UtilManager();
        }
        return this.Instance;
    }

    //MD5
    public static md5(str: string) {
        if (cc.sys.isBrowser) {
            str = new MD5().md5(str).toUpperCase()
        } else {
            str = new jsb.MD5().md5(str)
        }
        return str;
    }

    //保留小数
    public static fixed(score: number, fixedCount: number = 2) {
        return score.toFixed(fixedCount)
    }

    //转换字符串
    public static string(num: number) {
        return num.toString()
    }

    /**
      * 生成循环列表
      * @param data 传入的参数数组
      * @param onItemCallBack 方法回调(返回参数：item, data, index)
      * @param scrollView scroll列表
      * @param viewItem item节点
      * @param itemSpacing item之间的间距（默认为0间距）
    */
    public initScrollView(data: any[], onItemCallBack: Function, scrollView: cc.ScrollView, viewItem: cc.Node, itemSpacing: number = 0) {

        enum ScrollDirEnum {
            Vertical,
            Horizon
        }

        let content = scrollView.content
        content.destroyAllChildren()

        let itemList = []
        let scrollDir: ScrollDirEnum = scrollView.horizontal ? ScrollDirEnum.Horizon : ScrollDirEnum.Vertical
        let total_num: number = data.length  // 一共需要显示的item的数量
        let display_num: number = 0   // 实际生成的item的数量
        let item_distance = 0  // item之间的距离
        let needSize = 0  // content需要生成的最大长度
        let visibleSize = 0  // content可以显示的最大长度
        // let minPos: number = 0  // content顶部位置
        // let maxPos: number = 0  // content底部位置
        // let minVisibleY: number = 0  // 
        // let maxVisibleY: number = 0  // 
        let initX = 0        // 起始坐标
        let initY = 0        // 起始坐标
        let minIdx: number = 0  // 最小显示索引
        let maxIdx: number = 0  // 最大显示索引

        if (scrollDir == ScrollDirEnum.Horizon) {
            item_distance = viewItem.width + itemSpacing
            needSize = item_distance * total_num
            visibleSize = scrollView.node.getContentSize().width
            display_num = Math.ceil(visibleSize / item_distance) + 1
            initX = viewItem.width / 2
            initY = 0
            content.setContentSize(new cc.Size(needSize, content.getContentSize().height))
        }
        else {
            item_distance = viewItem.height + itemSpacing
            needSize = item_distance * total_num
            visibleSize = scrollView.node.getContentSize().height
            display_num = Math.ceil(visibleSize / item_distance) + 1
            initX = 0
            initY = - viewItem.height / 2
            content.setContentSize(new cc.Size(content.getContentSize().width, needSize))
        }

        let curX = 0
        let curY = 0
        for (let index = 0; index < display_num; index++) {
            if (data[index] == null) {
                break
            }
            let obj = cc.instantiate(viewItem)
            obj.parent = content
            obj.active = true
            if (scrollDir == ScrollDirEnum.Horizon) {
                curX = initX + item_distance * index
            }
            else {
                curY = initY - item_distance * index
            }
            obj.setPosition(cc.v2(curX, curY))
            onItemCallBack(obj, data[index], index)
            itemList.push(obj)
            maxIdx = index
        }
        minIdx = 0


        let onScrollingCallBack = () => {
            let scrollOffset = 0
            let idx: number = 0
            if (scrollDir == ScrollDirEnum.Horizon) {
                scrollOffset = - scrollView.getScrollOffset().x
                idx = Math.floor(scrollOffset / item_distance)
                if (idx > minIdx) {
                    if (data[1 + maxIdx] == null) {
                        return
                    }
                    let curX = initX + item_distance * (1 + maxIdx)
                    let obj = itemList.shift()
                    obj.parent = content
                    obj.active = true
                    obj.setPosition(cc.v2(curX, 0))
                    onItemCallBack(obj, data[maxIdx + 1], maxIdx + 1)
                    itemList.push(obj)

                    minIdx = minIdx + 1
                    maxIdx = maxIdx + 1
                }
                else {
                    if (data[minIdx - 1] == null || idx == minIdx) {
                        return
                    }
                    let curX = initX + item_distance * (minIdx - 1)
                    let obj = itemList.pop()
                    obj.parent = content
                    obj.active = true
                    obj.setPosition(cc.v2(curX, 0))
                    onItemCallBack(obj, data[minIdx - 1], minIdx - 1)
                    itemList.unshift(obj)

                    minIdx = minIdx - 1
                    maxIdx = maxIdx - 1
                }
            }
            else {

                scrollOffset = scrollView.getScrollOffset().y
                idx = Math.floor(scrollOffset / item_distance)

                if (idx > minIdx) {
                    if (data[1 + maxIdx] == null) {
                        return
                    }
                    let curY = initY - item_distance * (1 + maxIdx)
                    let obj = itemList.shift()
                    obj.parent = content
                    obj.active = true
                    obj.setPosition(cc.v2(0, curY))
                    onItemCallBack(obj, data[maxIdx + 1], maxIdx + 1)
                    itemList.push(obj)

                    minIdx = minIdx + 1
                    maxIdx = maxIdx + 1
                }
                else {
                    if (data[minIdx - 1] == null || idx == minIdx) {
                        return
                    }
                    let curY = initY - item_distance * (minIdx - 1)
                    let obj = itemList.pop()
                    obj.parent = content
                    obj.active = true
                    obj.setPosition(cc.v2(0, curY))
                    onItemCallBack(obj, data[minIdx - 1], minIdx - 1)
                    itemList.unshift(obj)

                    minIdx = minIdx - 1
                    maxIdx = maxIdx - 1
                }
            }
        }

        scrollView.node.on("scrolling", onScrollingCallBack, this);
    }

}