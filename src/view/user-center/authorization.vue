<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <div style="float: left">
          &nbsp;&nbsp;角色：
          <Input clearable @on-change="handleClear" v-model="params.roleName" placeholder="请输入角色" style="width: 180px"/>
          &nbsp;&nbsp;
          <Button @click="Search" class="search-btn" type="primary">
            <Icon type="ios-search"/>&nbsp;&nbsp;搜索
          </Button>
        </div>
        <div style="text-align: right">
          <Button @click="refurbish" class="search-btn" style="font-weight: bold">刷新</Button>&nbsp;&nbsp;&nbsp;&nbsp;
          <Button @click="add" class="search-btn" type="primary">
            <Icon type="md-add"/>&nbsp;&nbsp;添加账户
          </Button>
        </div>
      </div>
      <Table :data="tableData" :columns="columns" @search-form="Search" class="table"
             @on-sort-change="onSortChange">
        <template slot="roleName" slot-scope="{ row }">
          <Tag color="blue">{{row.roleName}}</Tag>
        </template>
        <template slot="action" slot-scope="{row,index}">
          <Button @click="authorize(row,index)">授权</Button>
          <Divider type="vertical"/>
          <Button type="primary" @click="edit(row,index)">编辑</Button>
          <Divider type="vertical"/>
          <Poptip confirm @on-ok="delRow(row)" title="确认要删除吗?" transfer>
            <Button type="warning">删除</Button>
          </Poptip>
        </template>
        <slot name="header" slot="header"></slot>
        <slot name="footer" slot="footer"></slot>
        <slot name="loading" slot="loading"></slot>
      </Table>
      <div style="margin: 10px;overflow: hidden;text-align: right">
        <Page :total="params.total" :current="params.page" :page-size="params.rows" show-sizer show-elevator
              show-total @on-change="page" @on-page-size-change='pageLimit'/>
      </div>
      <!-- 添加 -->
      <Modal v-draggable="options" title="新增" width="600"/>
      <Modal v-model="modalAdd" v-draggable="options" @on-ok="addOk(accountItem)" :mask-closable="false" title="添加"
             width="600">
        <Form :model="accountItem" :label-width="80" style="width: 60%;margin: 0 auto">
          <formItem label="角色：">
            <Input v-model="accountItem.roleName" placeholder="请输入角色">
              <span slot="prepend">
                  <Icon :size="16" type="ios-person"/>
              </span>
            </Input>
          </formItem>
          <formItem label="描述：">
            <Input v-model="accountItem.describe" placeholder="请输入角色描述">
              <span slot="prepend">
                 <Icon type="ios-chatboxes"/>
                </span>
            </Input>
          </formItem>
        </Form>
      </Modal>
      <!-- 编辑 -->
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalEdit" v-draggable="options" @on-ok="editOk(accountItem)" :mask-closable="false" title="编辑"
             width="600">
        <Form :model="accountItem" :label-width="80" style="width: 60%;margin: 0 auto">
          <formItem label="角色：">
            <Input v-model="accountItem.roleName" placeholder="请输入角色">
              <span slot="prepend">
                  <Icon :size="16" type="ios-person"/>
              </span>
            </Input>
          </formItem>
          <formItem label="描述：">
            <Input v-model="accountItem.describe" placeholder="请输入角色描述">
              <span slot="prepend">
                 <Icon type="ios-chatboxes"/>
                </span>
            </Input>
          </formItem>
          <formItem label="创建时间：">
            <DatePicker disabled type="datetime" placeholder="请选择时间"
                        v-model="accountItem.createDate"></DatePicker>
          </formItem>
        </Form>
      </Modal>
      <!-- 编辑 -->
      <Modal v-draggable="options" title="授权" width="400"/>
      <Modal v-model="modalAuthorize" v-draggable="options" @on-ok="authorizeOk()" :mask-closable="false" title="授权"
             width="400">
        <div style="margin-left: 50px">
          <Tree ref="tree" :data="menuList" show-checkbox :render="renderContent"></Tree>
        </div>
      </Modal>
      <Spin fix v-if="spinShow">
        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </Card>
  </div>
</template>

<script>
import Tables from '_c/tables'
import {
  getRoleList,
  saveRole,
  updateRole,
  deleteRole,
  roleMenuQuery,
  authorizationMenu
} from '@/api/roleMenu'
import {formatDate, formatState, formatPhone} from '@/common/Format'

export default {
  name: 'customer',
  components: {
    Tables
  },
  data() {
    return {
      options: {
        trigger: '.ivu-modal-header',
        body: '.ivu-modal',
        recover: true
      },
      columns: [
        {
          title: '角色',
          key: 'roleName',
          sortable: 'custom',
          slot: 'roleName'
        },
        {
          title: '描述',
          key: 'describe',
          tooltip: true
        },
        {
          title: '创建时间',
          key: 'createDate',
          sortable: 'custom',
          tooltip: true,
          render: (h, params) => {
            return h('div',
              formatDate(new Date(params.row.createDate), 'yyyy-MM-dd')
            )
          }
        },
        {
          title: '操作',
          key: 'action',
          slot: 'action',
          align: 'center',
          width: 240
        }
      ],
      modalEdit: false,
      modalAdd: false,
      modalAuthorize: false,
      accountItem: {},
      tableData: [],
      searchValue: '',
      searchKey: '',
      menuList: [],
      roleMenu: [],
      idAndIds: {},
      spinShow: false,
      params: {total: 0, page: 1, rows: 10}
    }
  },
  methods: {
    getRole() {
      this.spinShow = true
      getRoleList(this.params).then(res => {
        this.params.total = res.data.total
        this.tableData = res.data.rows
        this.spinShow = false
        this.$refs.scroll.parentElement.scrollTop = 0
      }).catch(() => this.spinShow = false)
    },
    page(value) {
      this.params.page = value
      this.getRole()
    },
    pageLimit(value) {
      this.params.rows = value
      this.getRole()
    },
    handleClear(e) {
      if (e.target.value === '') this.getRole()
    },
    Search() {
      this.params.page = 1
      this.getRole()
    },
    Reset() {
      this.params = {total: 0, page: 1, rows: 10}
      this.getRole()
    },
    refurbish() {
      this.getRole()
    },
    onSortChange(column) {
      switch (column.order) {
        case 'normal':
          delete this.params.order
          this.getRole()
          break
        default:
          this.params.sort = column.key
          this.params.order = column.order
          this.getRole()
          break
      }
    },
    delRow(row) {
      deleteRole(row.id).then(() => {
        this.getRole()
      })
    },
    add() {
      this.modalAdd = true
      this.accountItem = {}
    },
    addOk(accountItem) {
      saveRole(accountItem).then(() => {
        this.getRole()
      })
    },
    edit(row, index) {
      this.modalEdit = true
      this.accountItem = {...this.tableData[index]}
    },
    editOk(accountItem) {
      updateRole(accountItem).then(() => {
        this.getRole()
      })
    },
    authorize(row, index) {
      this.spinShow = true
      this.idAndIds.id = row.id
      roleMenuQuery(row.id).then(res => {
        this.menuList = res.data.menu
        this.roleMenu = res.data.roleMenu
        this.menuList = this.getSelected(this.roleMenu, this.menuList)
        this.modalAuthorize = true
        this.spinShow = false
      }).catch(() => this.spinShow = false)
    },
    authorizeOk() {
      this.handleSpinCustom()
      this.idAndIds.ids = this.$refs.tree.getCheckedAndIndeterminateNodes().map(s => s.id)
      authorizationMenu(this.idAndIds).then(() => {
        this.getRole()
        this.$Spin.hide()
      })
    },
    getSelected(roleMenu, menuList) {
      let m = JSON.stringify(menuList);
      for (let i = 0; i < roleMenu.length; i++) {
        if (m.indexOf("\"parentId\":" + roleMenu[i].menuId) < 0) {
          m = m.replace("\"id\":" + roleMenu[i].menuId, "\"checked\":true,\"id\": " + roleMenu[i].menuId);
        } else {
          m = m.replace("\"id\":" + roleMenu[i].menuId, "\"expand\":true,\"id\": " + roleMenu[i].menuId);
        }
      }
      return JSON.parse(m)
    },
    renderContent(h, {root, node, data}) {
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', [
          h('Icon', {
            props: {
              type: 'ios-paper-outline'
            },
            style: {
              marginRight: '8px'
            }
          }),
          h('span', data.title)
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right',
            marginRight: '32px'
          }
        })
      ])
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
  mounted() {
    this.getRole()
  }
}
</script>

<style>
  .table td {
    height: 70px;
  }

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
