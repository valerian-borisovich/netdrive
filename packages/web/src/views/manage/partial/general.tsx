import { ref, defineComponent, watch, onMounted, toRef, toRefs, reactive } from 'vue'
import { useStore } from 'vuex'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Layout, Button, Form } from 'ant-design-vue'
import request from '@/utils/request'
import Icon from '@/components/icon'
import { SettingOutlined, DatabaseOutlined } from '@ant-design/icons-vue'
import { useSetting } from '@/hooks/useSetting'
import { Switch, Modal, Input } from 'ant-design-vue'
const { TextArea } = Input
const valueDisplay = (value: any, type: string) => {
  if (type == 'boolean') return Boolean(value) ? 'on' : 'off'
  else if (type == 'string') return value
  else if (type == 'array') {
    const len = value.length
    const nodes = value.slice(0, 3).map((i: string) => <div>{i}</div>)
    if (len > 3) {
      nodes.push(<div>wait {len} </div>)
    }
    return nodes
  }
}

export default defineComponent({
  setup() {
    const fields = [
      { code: 'token', label: 'Token', type: 'string', secret: true },
      { code: 'title', label: 'Title', type: 'string' },
      { code: 'index_enable', label: 'Index enable', type: 'boolean' },
      { code: 'expand_single_disk', label: 'Expand single disk', type: 'boolean' },
      { code: 'anonymous_download_enable', label: 'Anonymous download enable', type: 'boolean' },
      { code: 'fast_mode', label: 'Fast mode', type: 'boolean' },
      { code: 'ignores', label: 'Ignores', type: 'array' },
      { code: 'acl_file', label: 'ACL', type: 'string' },
      { code: 'webdav_path', label: 'WebDAV path', type: 'string' },
      { code: 'webdav_proxy', label: 'WebDAV proxy', type: 'boolean' },
      { code: 'webdav_user', label: 'WebDAV username', type: 'string' },
      { code: 'webdav_pass', label: 'WebDAV password', type: 'string' },
      { code: 'script', label: 'Script', type: 'string' },
      { code: 'style', label: 'Style', type: 'string' },
    ]
    const { config, setConfig } = useSetting()

    const createInputModifier = (label: string, code: string, isSecret: boolean | undefined) => {
      const modifier = ref(isSecret ? '' : config[code])
      const handleChange = (e: any) => modifier.value = e.target.value

      const modal = Modal.confirm({
        title: label,
        class: 'fix-modal--narrow-padding',
        content: (
          <div>
            <TextArea defaultValue={modifier.value} onChange={handleChange} placeholder="please enter" />
          </div>
        ),
        onOk: () => {
          setConfig({ [code]: modifier.value })
          modal.destroy()
        },
      })
    }

    const createListModifier = (label: string, code: string) => {
      const modifier = ref(config[code].join('\n'))
      const handleChange = (e: any) => modifier.value = e.target.value

      const modal = Modal.confirm({
        title: label,
        class: 'fix-modal--narrow-padding',
        content: (
          <div>
            <TextArea defaultValue={modifier.value} onChange={handleChange} style={{ height: '150px' }} placeholder="please enter" />
          </div>
        ),
        onOk: () => {
          setConfig({ [code]: modifier.value.split('\n').filter(Boolean) })
          modal.destroy()
        },
      })
    }
    return () => (
      <div>
        {fields.map((i) => (
          <div class="item">
            <div class="item__header">
              <div class="item__meta">
                <h4 class="item__meta-title">{i.label}</h4>
                <div class="item__meta-desc">{i.secret ? '' : valueDisplay(config[i.code], i.type)}</div>
              </div>
            </div>
            <div class="item-action">
              {i.type == 'boolean' ? (
                <Switch checked={config[i.code]} onChange={(e) => setConfig({ [i.code]: e })} />
              ) : i.type == 'string' ? (
                <a onClick={() => createInputModifier(i.label, i.code, i.secret)}>Change</a>
              ) : i.type == 'array' ? (
                <a onClick={() => createListModifier(i.label, i.code)}>Change</a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )
  },
})
