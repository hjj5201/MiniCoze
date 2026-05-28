import React from 'react'
import styles from './Header.module.css'
import { ApiOutlined } from '@ant-design/icons'

function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.logoBox}>
                    <img src="/favicon.png" alt="logo" />
                </div>
                <span className={styles.title}>Mini-Coze</span>
            </div>

            <div className={styles.right}>
                <div className={styles.pluginBtn}>
                    <ApiOutlined style={{ fontSize: 18 }} />
                    <span>插件</span>
                </div>
            </div>
        </header>
    )
}

export { Header }