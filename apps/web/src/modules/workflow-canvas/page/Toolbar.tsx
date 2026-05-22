import React from 'react'
import styles from './Toolbar.module.css'
import {
    AimOutlined,
    DownOutlined,
    MessageOutlined,
    AppstoreOutlined,
    PictureOutlined,
    EditOutlined,
    PlusOutlined,
    ToolOutlined,
    PlayCircleOutlined
} from '@ant-design/icons'

function Toolbar() {
    return (
        <div>
            <div className={styles.tool}>
                <div className={styles.MouseModeSwitch}>
                    <AimOutlined style={{ fontSize: 16 }} />
                    <DownOutlined style={{ fontSize: 16 }} />
                </div>

                <div className={styles.ViewScaleControl}>
                    <p>75%</p>
                    <DownOutlined style={{ fontSize: 16 }} />
                </div>

                <div>
                    <button className={styles.buttonStyles}>
                        <MessageOutlined style={{ fontSize: 16 }} />
                    </button>
                </div>

                <div>
                    <button className={styles.buttonStyles}>
                        <AppstoreOutlined style={{ fontSize: 16 }} />
                    </button>
                </div>

                <div>
                    <button className={styles.buttonStyles}>
                        <PictureOutlined style={{ fontSize: 16 }} />
                    </button>
                </div>

                <div>
                    <button className={styles.buttonStyles}>
                        <EditOutlined style={{ fontSize: 16 }} />
                    </button>
                </div>

                <div className={styles.AddNodeButton}>
                    <button>
                        <PlusOutlined style={{ fontSize: 16 }} />
                        <span>添加节点</span>
                    </button>
                </div>
            </div>

            <div className={styles.run}>
                <div>
                    <button>
                        <ToolOutlined style={{ fontSize: 14 }} />
                    </button>
                </div>

                <div className={styles.RunTest}>
                    <button>
                        <PlayCircleOutlined style={{ fontSize: 14 }} />
                        <span>试运行</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Toolbar