import React from 'react'
import styles from './RetrieveTest.module.css'
import {
    AimOutlined,
    HistoryOutlined,
    AppstoreOutlined,
    SlidersOutlined
} from '@ant-design/icons'
function RetrieveTest() {
    return (
        <div className={styles.page}>
            <div className={styles.left}>
                <div className={styles.header}>
                    <h2>召回测试</h2>
                    <p>根据给定的查询文本测试知识的召回效果。</p>
                </div>

                <div className={styles.inputCard}>
                    <div className={styles.inputTop}>
                        <span className={styles.title}>源文本</span>

                        <button className={styles.vectorBtn}>
                            <AppstoreOutlined />
                            <span>向量检索</span>
                            <SlidersOutlined />
                        </button>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="请输入文本，建议使用简短的陈述句。"
                        maxLength={200}
                    />

                    <div className={styles.inputBottom}>
                        <span className={styles.count}>0/200</span>
                        <button className={styles.testBtn}>测试</button>
                    </div>
                </div>

                <div className={styles.recordHeader}>
                    <h3>记录</h3>
                </div>

                <div className={styles.recordBox}>
                    <div className={styles.historyIcon}>
                        <HistoryOutlined />
                    </div>
                    <span>最近无查询结果</span>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.empty}>
                    <AimOutlined className={styles.emptyIcon} />
                    <span>召回测试结果将展示在这里</span>
                </div>
            </div>
        </div>
    )
}

export { RetrieveTest }