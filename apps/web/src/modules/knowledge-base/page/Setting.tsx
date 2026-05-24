import React from 'react'
import styles from './Setting.module.css'
import { LikeFilled, DownOutlined } from '@ant-design/icons'
function Setting() {
    return (
        <div className={styles.content}>
            <div className={styles.contentHeader}>
                <h1>知识库设置</h1>
                <span>在这里，您可以修改此知识库的属性和检索设置</span>
            </div>
            <div className={styles.contenBody}>
                <div className={styles.nameAndIcon}>
                    <span>名称和图标</span>
                    <div className={styles.nameInput}>
                        <div className={styles.iconBox}><LikeFilled style={{ fontSize: 20, color: '#FFC107' }} /></div>
                        <input type="text" placeholder='用户名称' />
                    </div>

                </div>
                <div className={styles.description}>
                    <span>描述</span>
                    <textarea placeholder='描述该数据集的内容。详细描述可以让AI更快访问数据集的内容。如果为空，Minicoze将使用默认的命中策略' />
                </div>
                <div className={styles.permission}>
                    <span>可见权限</span>
                    <div className={styles.permissionInput}>
                        <div className={styles.permissionLeft}>
                            <div className={styles.D}>D</div>
                            <span className={styles.permissionText}>只有我</span>
                        </div>
                        <DownOutlined className={styles.arrowIcon} />
                    </div>
                </div>
                <div className={styles.underline} ></div>
                <button className={styles.save}>
                    保存
                </button>
            </div>
        </div>
    )
}

export { Setting }