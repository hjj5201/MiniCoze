import React from 'react'
import styles from './Header.module.css'
import {
    LeftOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    EditOutlined,
    CopyOutlined,
    HistoryOutlined,
    MoreOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '../components/Tooltip'
function Header() {
    const navigate = useNavigate()
    const handleExitWorkflow = () => {
        navigate('/homepage')
    }

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <div className={styles.backbox}>
                    <button className={styles.back} onClick={handleExitWorkflow}>
                        <LeftOutlined style={{ fontSize: 14 }} />
                    </button>
                </div>

                <img
                    className={styles.logo}
                    src="/favicon.png"
                    alt=""
                />

                <div className={styles.workflowinfo}>
                    <div className={styles.workflowinfoTop}>
                        <Tooltip text='工作流名称（待定）'>
                            <span className={styles.workflowTitle}>工作流名称（待定）</span>
                        </Tooltip>

                        <Tooltip text='工作流详细介绍（待定）'>
                            <button
                                className={styles.workflowintroduction}
                                title="工作流介绍（待定）"
                            >
                                <InfoCircleOutlined style={{ fontSize: 14 }} />
                            </button>
                        </Tooltip>
                        <Tooltip text='已发布'>
                            <button className={styles.workflowpublish}>
                                <CheckCircleOutlined style={{ fontSize: 14 }} />
                            </button>
                        </Tooltip>

                        <Tooltip text='编辑'>
                            <button className={styles.workfloweditor}>
                                <EditOutlined style={{ fontSize: 14 }} />
                            </button>
                        </Tooltip>
                    </div>

                    <div className={styles.workflowinfoBottom}>
                        <div className={styles.saveTime}>
                            自动保存 5-14 11:12:44（待定）
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <Tooltip text='查看引用关系'>
                    <div className={styles.check}>
                        <button>
                            <CopyOutlined style={{ fontSize: 14 }} />
                        </button>
                    </div>
                </Tooltip>

                <Tooltip text='历史查询'>
                    <div className={styles.history}>
                        <button>
                            <HistoryOutlined style={{ fontSize: 14 }} />
                        </button>
                    </div>
                </Tooltip>

                <div className={styles.publish}>
                    <button>
                        <span>发布</span>
                    </button>
                </div>

                <div>
                    <button>
                        <MoreOutlined style={{ fontSize: 14 }} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Header