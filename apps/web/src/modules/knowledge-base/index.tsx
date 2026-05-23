
import React from 'react'
import { Header } from './page/Header'
import { Left } from './page/Left'
import { Outlet } from 'react-router-dom'
import styles from './index.module.css'
function KnowledgeBasePage() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.main}>
        <Left />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export { KnowledgeBasePage }