<template>
  <div>
    <Card shadow>
      <Row :gutter="16">
        <i-col span="6">
          <tree-table height="900" expand-key="title" :expand-type="false" :tree-type="true" :is-fold="false"
                      :selectable="false" @radio-click="rowClick" :columns="columns" :data="data">
            <template slot="order" slot-scope="scope">
              <Badge v-if="scope.row.status===1" status="success" text="有效"/>
              <Badge v-else="" status="error" text="无效"/>
            </template>
          </tree-table>
        </i-col>
        <div style="display: block;position: absolute;top: 0;bottom: 0;left: 25%;border-left: 1px solid #eee;"></div>
        <Col span="18">
          <Row>
            <Col span="24">
              <div class="search-con search-con-top">
                <ButtonGroup>
                  <Button type="primary" @click="setEnabled(true)">新建</Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="setEnabled(false)">编辑</Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="confirmModal = true">删除</Button>
                </ButtonGroup>
                <Modal
                  v-model="confirmModal"
                  title="提示"
                  @on-ok="handleRemove">
                  确定删除,菜单资源【{{formItem.menuName}}】吗?{{formItem.children && formItem.children.length > 0 ?
                  '存在子菜单,将一起删除.是否继续?' : ''}}

                </Modal>
              </div>
              <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="100">
                <FormItem label="父级菜单">
                  <treeselect :disabled="disabled" v-model="formItem.parentId" :options="selectTreeData"
                              :default-expand-level="1" :normalizer="treeSelectNormalizer"/>
                </FormItem>
                <FormItem label="菜单标识" prop="menuCode">
                  <Input :disabled="disabled" v-model="formItem.menuCode" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem label="菜单名称" prop="menuName">
                  <Input :disabled="disabled" v-model="formItem.menuName" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem label="请求地址" prop="path">
                  <Input :disabled="disabled" v-model="formItem.path" placeholder="请输入内容">
                    <Select :disabled="disabled" v-model="formItem.prefix" slot="prepend" style="width: 80px">
                      <Option value="/">/</Option>
                      <Option value="http://">http://</Option>
                      <Option value="https://">https://</Option>
                    </Select>
                    <Select :disabled="disabled" v-model="formItem.target" slot="append" style="width: 100px">
                      <Option value="_self">窗口内打开</Option>
                      <Option value="_blank">新窗口打开</Option>
                    </Select>
                  </Input>
                </FormItem>
                <FormItem label="图标">
                  <Input :disabled="disabled" v-model="formItem.icon" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem label="优先级">
                  <InputNumber :disabled="disabled" v-model="formItem.priority"></InputNumber>
                </FormItem>
                <FormItem label="状态">
                  <i-switch :disabled="disabled" v-model="formItem.statusSwatch" size="large">
                    <span slot="open">有效</span>
                    <span slot="close">无效</span>
                  </i-switch>
                </FormItem>
                <FormItem label="描述">
                  <Input :disabled="disabled" v-model="formItem.menuDesc" type="textarea" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem>
                  <Button :disabled="disabled" @click="handleSubmit" type="primary">保存</Button>
                  <Button :disabled="disabled" @click="setEnabled(true)" style="margin-left: 8px">重置</Button>
                </FormItem>
              </Form>
              <Divider orientation="left">操作资源</Divider>
              <menu-action :value="formItem"></menu-action>
            </Col>
          </Row>
        </Col>
      </Row>
      <Spin fix v-if="spinShow">
        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </Card>
  </div>
</template>

<script>
  import MenuAction from './menu-action'
  import {getMenuList} from '@/api/menu'

  export default {
    name: 'SystemMenu',
    components: {
      MenuAction
    },
    data() {
      return {
        confirmModal: false,
        disabled: true,
        selectTreeData: [],
        formItemRules: {
          menuCode: [
            {required: true, message: '菜单标识不能为空', trigger: 'blur'}
          ],
          menuName: [
            {required: true, message: '菜单名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix: '/',
          target: '_self',
          status: 1,
          statusSwatch: true,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        },
        columns: [
          {
            title: '菜单名称',
            key: 'title',
            minWidth: '200px'
          },
          {
            title: '状态',
            key: 'order',
            type: 'template',
            template: 'status'
          },
        ],
        data: [],
        spinShow: false
      }
    },
    methods: {
      getMenu() {
        getMenuList().then(res => {
          this.data = res.data
          console.log(this.data)
          this.spinShow = false
        }).catch(() => this.spinShow = false)
      },
      treeSelectNormalizer(node) {
        return {
          id: node.menuId,
          label: node.menuName,
          children: node.children
        }
      },
      setSelectTree(data) {
        const root = {
          menuId: 0,
          menuName: '根节点'
        }
        this.selectTreeData = [root].concat(data)
      },
      setEnabled(enabled) {
        if (enabled) {
          this.handleReset()
        }
        this.disabled = false
      },
      rowClick(data) {
        this.disabled = true
        this.handleReset()
        if (data) {
          this.formItem = Object.assign({}, data.row)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        }
      },
      handleReset() {
        this.formItem = {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix: '/',
          target: '_self',
          status: 1,
          statusSwatch: true,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        }
        this.$refs['menuForm'].resetFields()
      },
      handleSubmit() {
        this.$refs['menuForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.menuId) {
              updateMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.disabled = true
                  this.$Message.success('保存成功')
                }
                this.handleSearch()
              })
            } else {
              addMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.disabled = true
                  this.$Message.success('保存成功')
                }
                this.handleSearch()
              })
            }
          }
        })
      },
      handleRemove() {
        removeMenu({menuId: this.formItem.menuId}).then(res => {
          this.handleReset()
          this.handleSearch()
          if (res.code === 0) {
            this.$Message.success('删除成功')
          }
        })
      },
      handleSearch() {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          this.data = listConvertTree(res.data.list, opt)
          this.setSelectTree(this.data)
        })
      },
      handleSpinCustom() {
        this.$Spin.show({
          render: (h) => {
            return h('div', [
              h('Icon', {
                'class': 'demo-spin-icon-load',
                props: {
                  type: 'ios-loading',
                  size: 18
                }
              }),
              h('div', 'Loading')
            ])
          }
        })
      }
    },
    mounted: function () {
      this.getMenu()
    }
  }
</script>

<style>
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }

  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .demo-spin-col {
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
</style>
