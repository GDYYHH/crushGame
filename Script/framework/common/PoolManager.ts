/*
*   节点池
*   2020/3/16
*/

const {ccclass, property} = cc._decorator

@ccclass
export class PoolManager extends cc.Component {

    public poolMap: { [key: string]: cc.NodePool } = {}

    private enemyCount = 20;
    private static Instance: PoolManager = null;

    public static GetInstance(): PoolManager {
        if (this.Instance == null) {
            this.Instance = new PoolManager();
        }
        return this.Instance;
    }

    /**
     * 初始化节点池并创建节点
     * @param prefabs 预制体数组
     * @param enemyCount 创建数量 默认20
     */
    public initEnemy(prefabs: cc.Prefab[], enemyCount?: number): void {

        if (prefabs.length === 0) {
            cc.log("properties prefabs is null");
            return
        }

        if (enemyCount && enemyCount > 0) {
            this.enemyCount = enemyCount;
        }

        for (let i = 0; i < prefabs.length; i++) {
            let prefab = prefabs[i];
            if (prefab == undefined || prefab == null) {
                cc.log("prefab" + i + " is not found");
                break
            }
            this.poolMap[prefab.name + "Pool"] = new cc.NodePool()
            for (let j = 0; j < this.enemyCount; j++) {
                let enemy = cc.instantiate(prefab);
                enemy.active = false;
                this.poolMap[prefab.name + "Pool"].put(enemy);
            }
        }
    }

    /**
     * 获取节点池节点
     * @param prefab 
     * @param parentNode 
     */
    public createEnemy(prefab: cc.Prefab, parentNode: cc.Node): cc.Node {
        let enemy = null;
        if (this.poolMap[prefab.name + "Pool"].size() > 0) {
            enemy = this.poolMap[prefab.name + "Pool"].get();
        } else {
            enemy = cc.instantiate(prefab);
        }
        enemy.active = true;
        enemy.parent = parentNode;
        return enemy;
    }

    /**
     * 将节点退回节点池
     * @param enemy
     */
    public killEnemy(enemy: cc.Node): void {
        enemy.active = false
        this.poolMap[enemy.name + "Pool"].put(enemy)
    }

    /**
     * 清空节点池
     * @param enemy
     */
    public clearEnemy(enemy: cc.Node): void {
        this.poolMap[enemy.name + "Pool"].clear()
    }

}