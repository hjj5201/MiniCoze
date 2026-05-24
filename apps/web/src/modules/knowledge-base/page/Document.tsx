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
import { Dropdown } from 'antd'
import { useState } from 'react'
function Document() {
    const [status, setStatus] = useState('全部')
    const statusItems = [
        {
            key: 'all',
            label: '全部'
        },
        {
            key: 'queueing',
            label: '排队中'
        },
        {
            key: 'indexing',
            label: '索引中'
        },
        {
            key: 'paused',
            label: '已暂停'
        },
        {
            key: 'error',
            label: '错误'
        },
        {
            key: 'available',
            label: '可用'
        },
        {
            key: 'enabled',
            label: '已启用'
        },
        {
            key: 'disabled',
            label: '已禁用'
        },
        {
            key: 'archived',
            label: '已归档'
        }
    ]
    const handleStatusClick = ({ key }: { key: string }) => {
        const current = statusItems.find((item) => item.key === key)

        if (!current) return

        setStatus(current.label)
    }
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
                    <Dropdown
                        menu={{
                            items: statusItems,
                            onClick: handleStatusClick
                        }}
                        trigger={['click']}
                        placement='bottom'
                    >
                        <div className={styles.status}>

                            <span>{status}</span>
                            <CloseCircleFilled />
                        </div>
                    </Dropdown>
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
