import React from 'react'
import styles from './Left.module.css'
import { NavLink } from 'react-router-dom'
import { LikeFilled, EllipsisOutlined, FileTextFilled, BranchesOutlined, AimOutlined, SettingOutlined, ShareAltOutlined } from '@ant-design/icons'
function Left() {
    return (
        <div className={styles.left}>
            <div className={styles.leftTop}>
                <div className={styles.editor}>
                    <LikeFilled style={{ fontSize: 20, color: '#FFC107' }} />
                </div>
                <button><EllipsisOutlined style={{ fontSize: 20 }} /></button>
            </div>
            <div className={styles.leftCenter}>
                <div>
                    <NavLink
                        to="/knowledge-base/document"
                        className={({ isActive }) =>
                            isActive ? `${styles.iconBtn} ${styles.active}` : styles.iconBtn
                        }
                    ><FileTextFilled style={{ fontSize: 20, color: 'rgb(103, 111, 131)' }} /></NavLink>
                </div>
                <div>
                    <NavLink
                        to="/knowledge-base/productionline"
                        className={({ isActive }) =>
                            isActive ? `${styles.iconBtn} ${styles.active}` : styles.iconBtn
                        }>
                        <BranchesOutlined style={{ fontSize: 20, color: 'rgb(103, 111, 131)' }} />
                    </NavLink>
                </div>
                <div>
                    <NavLink
                        to="/knowledge-base/retrieveTest"
                        className={({ isActive }) =>
                            isActive ? `${styles.iconBtn} ${styles.active}` : styles.iconBtn
                        }
                    >
                        <AimOutlined style={{ fontSize: 20, color: 'rgb(103, 111, 131)' }} />
                    </NavLink>
                </div>
                <div>
                    <NavLink
                        to="/knowledge-base/setting"
                        className={({ isActive }) =>
                            isActive ? `${styles.iconBtn} ${styles.active}` : styles.iconBtn
                        }
                    >
                        <SettingOutlined style={{ fontSize: 20, color: 'rgb(103, 111, 131)' }} />
                    </NavLink>
                </div>
            </div>
            <div className={styles.leftBottom}>
                <ShareAltOutlined style={{ fontSize: 20, color: '#ccc' }} />
            </div>
        </div>
    )
}

export { Left }