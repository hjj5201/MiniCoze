import React from 'react'
import Header from './page/Header'
import Toolbar from './page/Toolbar'
import styles from './index.module.css'
function WorkflowCanvasPage() {
  return (
    <div className={styles.workflowPage}>
      <Header />
      <main className={styles.canvasArea}></main>
      <Toolbar />
    </div>
  )
}
export { WorkflowCanvasPage }