<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <div style="float: left">
          &nbsp;&nbsp;姓名：
          <Input clearable v-model="params.name" placeholder="请输入账号名" style="width: 100px"/>
          &nbsp;&nbsp;性别：
          <Select ref="select" v-model="params.sex" style="width:80px">
            <Option :value="1">男</Option>
            <Option :value="0">女</Option>
          </Select>
          &nbsp;&nbsp;健康状态：
          <Select ref="select" v-model="params.health" style="width:80px">
            <Option :value="1">健康</Option>
            <Option :value="0">生病</Option>
          </Select>
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
            <Icon type="md-add"/>&nbsp;&nbsp;添加信息
          </Button>
        </div>
      </div>
      <Table :data="tableData" :columns="columns" @search-form="Search" class="table"
             @on-sort-change="onSortChange">
        <template slot="sex" slot-scope="{ row }">
          <Badge v-if="row.sex===0" status="success" text="女"/>
          <Badge v-else="" status="processing" text="男"/>
        </template>
        <template slot="health" slot-scope="{ row }">
          <Badge v-if="row.health===0" status="error" text="生病"/>
          <Badge v-else="" status="success" text="健康"/>
        </template>
        <template slot="description" slot-scope="{row,index}">
          <Tooltip max-width="300" :content="row.description">
            <Button>查看描述</Button>
          </Tooltip>
        </template>
        <template slot="action" slot-scope="{row,index}">
          <Poptip confirm @on-ok="authorizeOk" content="content" transfer>
            <div slot="title">
              <Input v-model="accountItem.userName" placeholder="请输入绑定账号" style="width:160px"></Input>
            </div>
            <Button @click="authorize(row,index)">绑定</Button>
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
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalAdd" v-draggable="options" @on-ok="addOk(accountItem)" :mask-closable="false" title="添加"
             width="600">
        <Form :model="accountItem" :label-width="80" label-position="left" inline style="text-align: center">
          <formItem label="姓名：">
            <Input v-model="accountItem.name" placeholder="请输入老人姓名" style="width:160px"></Input>
          </formItem>
          <formItem label="性别：">
            <Select v-model="accountItem.sex" style="width:160px">
              <Option :value="1">男</Option>
              <Option :value="0">女</Option>
            </Select>
          </formItem>
          <formItem label="年龄：">
            <InputNumber :min="1" v-model="accountItem.age" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="身高(cm)：">
            <InputNumber :min="1" v-model="accountItem.height" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="体重(kg)：">
            <InputNumber :min="1" v-model="accountItem.weight" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="健康状态：">
            <Select v-model="accountItem.health" style="width:160px">
              <Option :value="1">健康</Option>
              <Option :value="0">生病</Option>
            </Select>
          </formItem>
          <formItem label="健康描述：">
            <textarea v-model="accountItem.description" rows="3" cols="20" placeholder="请输入健康描述"
                      style="width:400px"></textarea>
          </formItem>
        </Form>
      </Modal>
      <!-- 编辑 -->
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalEdit" v-draggable="options" @on-ok="editOk(accountItem)" :mask-closable="false" title="添加"
             width="600">
        <Form :model="accountItem" :label-width="80" label-position="left" inline style="text-align: center">
          <formItem label="姓名：">
            <Input v-model="accountItem.name" placeholder="请输入老人姓名" style="width:160px"></Input>
          </formItem>
          <formItem label="性别：">
            <Select v-model="accountItem.sex" style="width:160px">
              <Option :value="1">男</Option>
              <Option :value="0">女</Option>
            </Select>
          </formItem>
          <formItem label="年龄：">
            <InputNumber :min="1" v-model="accountItem.age" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="身高(cm)：">
            <InputNumber :min="1" v-model="accountItem.height" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="体重(kg)：">
            <InputNumber :min="1" v-model="accountItem.weight" style="width:160px"></InputNumber>
          </formItem>
          <formItem label="健康状态：">
            <Select v-model="accountItem.health" style="width:160px">
              <Option :value="1">健康</Option>
              <Option :value="0">生病</Option>
            </Select>
          </formItem>
          <formItem label="健康描述：">
            <textarea v-model="accountItem.description" rows="3" cols="20" placeholder="请输入健康描述"
                      style="width:400px"></textarea>
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
    getElderList,
    saveElder,
    updateElder,
    deleteElder
  } from '@/api/elder'
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
            title: '账号',
            key: 'userName'
          },
          {
            title: '姓名',
            key: 'name',
            sortable: 'custom'
          },
          {
            title: '年龄',
            key: 'age'
          },
          {
            title: '性别',
            slot: 'sex',
            sortable: true,
            key: 'sex'
          },
          {
            title: '身高(cm)',
            key: 'height'
          },
          {
            title: '体重(kg)',
            key: 'weight'
          },
          {
            title: '健康状态',
            slot: 'health',
            sortable: true,
            key: 'health'
          },
          {
            title: '健康描述',
            key: 'description',
            slot: 'description'
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
        tableData: [],
        searchValue: '',
        searchKey: '',
        params: {total: 0, page: 1, rows: 10}
      }
    },
    methods: {
      getElder() {
        this.loading = true
        getElderList(this.params).then(res => {
          this.params.total = res.data.total
          this.tableData = res.data.rows
          this.loading = false
          this.$refs.scroll.parentElement.scrollTop = 0
        }).catch(() => this.loading = false)
      },
      page(value) {
        this.params.page = value
        this.getElder()
      },
      pageLimit(value) {
        this.params.rows = value
        this.getElder()
      },
      Search() {
        this.params.page = 1
        this.getElder()
      },
      Reset() {
        this.params = {total: 0, page: 1, rows: 10}
        this.getElder()
      },
      refurbish() {
        this.getElder()
      },
      onSortChange(column) {
        switch (column.order) {
          case 'normal':
            delete this.params.order
            this.getElder()
            break
          default:
            this.params.sort = column.key
            this.params.order = column.order
            this.getElder()
            break
        }
      },
      authorize(row, index) {
        this.accountItem = {...this.tableData[index]}
      },
      authorizeOk() {
        this.loading = true
        updateElder(this.accountItem).then(() => {
          this.getElder()
        }).catch(() => this.loading = false)
      },
      delRow(row) {
        this.loading = true
        deleteElder(row.id).then(() => {
          this.getElder()
        }).catch(() => this.loading = false)
      },
      add() {
        this.modalAdd = true
        this.accountItem = {}
      },
      addOk(accountItem) {
        this.loading = true
        accountItem.uuid = this.uuid
        saveElder(accountItem).then(() => {
          this.getElder()
        }).catch(() => this.loading = false)
      },
      edit(row, index) {
        this.modalEdit = true
        this.accountItem = {...this.tableData[index]}
      },
      editOk(accountItem) {
        this.loading = true
        updateElder(accountItem).then(() => {
          this.getElder()
        })
      }
    },
    mounted() {
      this.getElder()
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
