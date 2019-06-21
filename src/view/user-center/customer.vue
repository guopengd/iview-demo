<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <div style="float: left">
          &nbsp;&nbsp;账号：
          <Input clearable v-model="params.userName" placeholder="请输入账号名" style="width: 100px"/>
          &nbsp;&nbsp;状态：
          <Select ref="select" v-model="params.status" style="width:80px">
            <Option :value="1">启用</Option>
            <Option :value="0">禁用</Option>
          </Select>
          &nbsp;&nbsp;手机号：
          <Input clearable v-model="params.phone" placeholder="请输入手机号码" style="width: 100px"/>
          &nbsp;&nbsp;邮箱：
          <Input clearable v-model="params.email" placeholder="请输入邮箱" style="width: 100px"/>
          &nbsp;&nbsp;
          <Button @click="Search" class="search-btn" type="primary">
            <Icon type="ios-search"/>&nbsp;&nbsp;搜索
          </Button>
          &nbsp;&nbsp;
          <Button @click="Reset" class="search-btn" type="primary">
            <Icon type="md-refresh"/>&nbsp;&nbsp;重置
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
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="启用"/>
          <Badge v-else="" status="error" text="禁用"/>
        </template>
        <template slot="action" slot-scope="{row,index}">
          <Poptip confirm @on-ok="authorizeOk" content="content" transfer>
            <div slot="title">
              <Select v-model="accountItem.roleId" style="width:160px">
                <Option v-for="item in roles" :value="item.id" :key="`authorization-${item.id}`">{{ item.roleName }}
                </Option>
              </Select>
            </div>
            <Button @click="authorize(row,index)">授权</Button>
          </Poptip>
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
             width="600" style="text-align: center">
        <Form :model="accountItem" :label-width="80" label-position="left" inline>
          <formItem label="账号：">
            <Input v-model="accountItem.userName" placeholder="请输入账号" style="width:160px"></Input>
          </formItem>
          <formItem label="状态：">
            <Select v-model="accountItem.status" style="width:160px">
              <Option :value="1">启用</Option>
              <Option :value="0">禁用</Option>
            </Select>
          </formItem>
          <formItem label="密码：">
            <Input v-model="accountItem.password" placeholder="请输入手密码" style="width:160px"></Input>
          </formItem>
          <formItem label="手机号：">
            <Input v-model="accountItem.phone" placeholder="请输入手机号" style="width:160px"></Input>
          </formItem>
          <formItem label="邮箱：">
            <Input v-model="accountItem.email" placeholder="请输入邮箱" style="width:160px"></Input>
          </formItem>
          <FormItem label="验证码：">
            <Input v-model="accountItem.code" placeholder="请输入验证码" style="width: 120px;float: left">
                  <span slot="prepend">
                    <Icon type="logo-codepen"/>
                  </span>
            </Input>&nbsp;&nbsp;
            <img :src="image" width="70px" @click="verifyCode">
          </FormItem>
        </Form>
      </Modal>
      <!-- 编辑 -->
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalEdit" v-draggable="options" @on-ok="editOk(accountItem)" :mask-closable="false" title="添加"
             width="600">
        <Form :model="accountItem" :label-width="80" label-position="left" inline style="text-align: center">
          <formItem label="账号：">
            <Input disabled v-model="accountItem.userName" placeholder="请输入账户名" style="width:160px"></Input>
          </formItem>
          <formItem label="状态：">
            <Select v-model="accountItem.status" style="width:160px">
              <Option :value="1">启用</Option>
              <Option :value="0">禁用</Option>
            </Select>
          </formItem>
          <formItem label="密码：">
            <Input v-model="accountItem.password" placeholder="请输入密码" style="width:160px"></Input>
          </formItem>
          <formItem label="手机号：">
            <Input v-model="accountItem.phone" placeholder="请输入手机号" style="width:160px"></Input>
          </formItem>
          <formItem label="邮箱：">
            <Input v-model="accountItem.email" placeholder="请输入邮箱" style="width:160px"></Input>
          </formItem>
          <formItem label="创建时间：">
            <DatePicker disabled type="datetime" placeholder="Select date"
                        v-model="accountItem.createDate"></DatePicker>
          </formItem>
        </Form>
      </Modal>
      <Spin fix v-if="loading">
        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </Card>
  </div>
</template>

<script>
  import Tables from '_c/tables'
  import {
    listCustomer,
    queryCustomer,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    getAuthorization
  } from '@/api/customer'
  import {formatDate, formatState, formatPhone} from '@/common/Format'
  import {createCode} from '@/api/user'

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
            title: '账号',
            key: 'userName',
            sortable: 'custom'
          },
          {
            title: '密码',
            key: 'password',
            tooltip: true
          },
          {
            title: '权限角色',
            key: 'roleId',
            tooltip: true,
            render: (h, params) => {
              return h('div', params.row.roleName)
            }
          },
          {
            title: '状态',
            slot: 'status',
            sortable: true,
            key: 'status'
          },
          {
            title: '手机号码',
            key: 'phone',
            tooltip: true
          },
          {
            title: '邮箱',
            key: 'email',
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
        loading: true,
        modalEdit: false,
        modalAdd: false,
        accountItem: {},
        uuid: 'null',
        image: {},
        tableData: [],
        searchValue: '',
        searchKey: '',
        arr: [1, 2, 3, 4],
        roles: [],
        disabled: true,
        params: {total: 0, page: 1, rows: 10}
      }
    },
    methods: {
      getCustomer() {
        this.loading = true
        listCustomer(this.params).then(res => {
          this.params.total = res.data.total
          this.tableData = res.data.rows
          this.roles = res.data.roles
          this.loading = false
          this.$refs.scroll.parentElement.scrollTop = 0
        }).catch(() => this.loading = false)
      },
      page(value) {
        this.params.page = value
        this.getCustomer()
      },
      pageLimit(value) {
        this.params.rows = value
        this.getCustomer()
      },
      Search() {
        this.params.page = 1
        this.getCustomer()
      },
      Reset() {
        this.params = {total: 0, page: 1, rows: 10}
        this.getCustomer()
      },
      refurbish() {
        this.getCustomer()
      },
      onSortChange(column) {
        switch (column.order) {
          case 'normal':
            delete this.params.order
            this.getCustomer()
            break
          default:
            this.params.sort = column.key
            this.params.order = column.order
            this.getCustomer()
            break
        }
      },
      delRow(row) {
        this.loading = true
        deleteCustomer(row.id).then(() => {
          this.getCustomer()
        }).catch(() => this.loading = false)
      },
      add() {
        this.verifyCode()
        this.modalAdd = true
        this.accountItem = {}
      },
      addOk(accountItem) {
        this.loading = true
        accountItem.uuid = this.uuid
        addCustomer(accountItem).then(() => {
          this.getCustomer()
        }).catch(() => this.loading = false)
      },
      authorize(row, index) {
        this.accountItem = {...this.tableData[index]}
      },
      authorizeOk() {
        this.loading = true
        updateCustomer(this.accountItem).then(() => {
          this.getCustomer()
        }).catch(() => this.loading = false)
      },
      edit(row, index) {
        this.modalEdit = true
        this.accountItem = {...this.tableData[index]}
      },
      editOk(accountItem) {
        this.loading = true
        updateCustomer(accountItem).then(() => {
          this.getCustomer()
        })
      },
      verifyCode() {
        createCode(this.uuid).then(res => {
          this.image = "data:img/jpg;base64," + res.data.image
          this.uuid = res.data.uuid
        })
      }
    },
    mounted() {
      this.getCustomer()
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
