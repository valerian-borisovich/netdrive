import { ref, defineComponent, watch, onMounted, toRef, toRefs, reactive, watchEffect } from 'vue'
import Icon from '@/components/icon'
import { useSetting } from '@/hooks/useSetting'
import { Layout, Button, Form, Modal, Popconfirm } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import Modifier from './drive-modifier'

export default defineComponent({
  setup() {
    const { config, setConfig } = useSetting()
    const createModifier = (data: IDrive, idx = -1) => {
      const updateData = (modifyData: IDrive) => {
        const saveData = [...config.drives]
        // console.log(saveData, idx)
        if (idx == -1) {
          saveData.push(modifyData)
        } else {
          saveData[idx] = modifyData
        }
        setConfig({ drives: saveData })
      }

      const modal = Modal.confirm({
        class: 'fix-modal--alone',
        width: '720px',
        closable: true,
        content: (
          <div>
            <Modifier defaultValue={data} onUpdate={updateData} />
          </div>
        ),
        onOk: () => {
          modal.destroy()
        },
      })
    }

    const onCreateDrive = () => {
      createModifier(
        {
          name: '',
          path: {
            protocol: '',
          },
        },
        -1,
      )
    }

    const remove = (data: IDrive, idx: number) => {
      setConfig({ drives: config.drives.filter((_: any, i: number) => i != idx) })
    }

    const orderUp = (data: IDrive, idx: number) => {
      if (idx > 0) {
        const drives = config.drives
        const saveData = [...drives]
        const a = drives[idx - 1],
          b = drives[idx]
        saveData[idx - 1] = b
        saveData[idx] = a
        setConfig({ drives: saveData })
      }
    }

    return () => (
      <div>
        <div class="setting-drive__header">
          <Button type="primary" onClick={onCreateDrive}>
            {{
              default: () => 'Mount',
              icon: () => <PlusOutlined />,
            }}
          </Button>
        </div>
        <div>
          {config.drives.map((i: IDrive, idx: number) => (
            <div class="item">
              <div class="item__header">
                <Icon class="item__icon" style={{ fontSize: '32px' }} type="icon-folder" />
                <div class="item__meta">
                  <h4 class="item__meta-title">{i.name}</h4>
                  <div class="item__meta-desc">{i.path.protocol}</div>
                </div>
              </div>
              <div class="item-action">
                <a onClick={() => createModifier(i, idx)}>Modify</a>
                <Popconfirm title="Confirm Remove?" ok-text="OK" cancel-text="Cancel" onConfirm={() => remove(i, idx)}>
                  <a>Remove</a>
                </Popconfirm>
                <a onClick={() => orderUp(i, idx)}>Up</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
