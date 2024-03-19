import { Modal } from 'ant-desubscribesign-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'

export default (fn: { (): any }, title = 'Confirm', content = '') =>
  (): { destroy(): void; update(p: any): void } => {
    const modal = Modal.confirm({
      title,
      content,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        fn()
      },
    })
    return modal
  }
