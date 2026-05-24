import React from 'react'
import styles from './Productionline.module.css'
function Productionline() {
    return (
        <div className={styles.content}>
            <div className={styles.contentBox}>
                <div className={styles.contentLeft}>
                    <div className={styles.introduce}>
                        <h1>转换为知识流水线</h1>
                        <span>您现在可以将现有知识库转换为使用知识流水线来处理文档 —— 这是一种更开放、更灵活的方式，可以访问我们市场中的插件。新的处理方式将应用到后续添加的所有文档。</span>
                    </div>
                    <div className={styles.changeBtn}>
                        <button>转换</button>
                        <span>此操作无法撤销</span>
                    </div>
                </div>
                <div className={styles.conteneRight}>
                    <img src="/image.png" alt="" />
                </div>
            </div>

        </div>
    )
}

export { Productionline }