import styles from './Document.module.css'
import {
    CloseCircleFilled,
    DownOutlined,
    FolderAddOutlined,
    FormOutlined,
    MenuFoldOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

function Document() {
    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <h1>文档</h1>
                <div className={styles.introduce}>
                    <span>知识库的所有文件都在这里显示，整个知识库都可以链接到 MiniCoze 引用或通过 Chat 插件进行索引。</span>
                    <a href="">了解更多</a>
                </div>
            </div>

            <div className={styles.kbToolbar}>
                <div className={styles.search}>
                    <div className={styles.status}>
                        <span>全部</span>
                        <CloseCircleFilled />
                    </div>

                    <div className={styles.searchinput}>
                        <SearchOutlined />
                        <input type="text" placeholder="搜索" />
                    </div>

                    <div className={styles.uploadTime}>
                        <div className={styles.uploadTimeLeft}>
                            <span>排序:</span>
                            <span>上传时间</span>
                            <DownOutlined style={{ fontSize: 12 }} />
                        </div>
                        <button className={styles.uploadTimeRight}>
                            <MenuFoldOutlined />
                        </button>
                    </div>
                </div>

                <div className={styles.fileActions}>
                    <div className={styles.metadata}>
                        <FormOutlined style={{ fontSize: 15 }} />
                        <span>元数据</span>
                    </div>
                    <button className={styles.addFile}>
                        <PlusOutlined />
                        <span>添加文件</span>
                    </button>
                </div>
            </div>

            <div className={styles.addDocument}>
                <div className={styles.addDocumentBox}>
                    <div className={styles.fileIcon}>
                        <FolderAddOutlined style={{ fontSize: 24 }} />
                    </div>
                    <span>还没有文档</span>
                    <p>您可以上传文件、从网站同步，或者从网络应用程序（如飞书、GitHub 等）同步。</p>
                    <button>
                        <PlusOutlined />
                        <span>添加文件</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export { Document }
