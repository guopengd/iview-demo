<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <div style="float: left">
          &nbsp;&nbsp;活动名称：
          <Input clearable v-model="params.name" placeholder="请输入账号名" style="width: 100px"/>
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
            <Icon type="md-add"/>&nbsp;&nbsp;添加活动
          </Button>
        </div>
      </div>
      <Table :data="tableData" :columns="columns" @search-form="Search" class="table"
             @on-sort-change="onSortChange">
        <template slot="action" slot-scope="{row,index}">
          <Button type="primary" @click="edit(row,index)">编辑</Button>
          <Divider type="vertical"/>
          <Poptip confirm @on-ok="delRow(row)" title="确认要删除吗?" transfer>
            <Button type="warning">删除</Button>
          </Poptip>
        </template>
        <template slot="description" slot-scope="{row,index}">
          <Tooltip max-width="300" :content="row.description">
            <Button>查看描述</Button>
          </Tooltip>
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
          <formItem label="活动名称：">
            <Input v-model="accountItem.name" placeholder="请输入活动名称"></Input>
          </formItem>
          <formItem label="活动描述：">
              <textarea v-model="accountItem.description" rows="3" cols="20" placeholder="请输入活动描述"
                        style="width:60%"></textarea>
          </formItem>
        </Form>
      </Modal>
      <!-- 编辑 -->
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalEdit" v-draggable="options" @on-ok="editOk(accountItem)" :mask-closable="false" title="编辑"
             width="600">
        <Form :model="accountItem" :label-width="80" style="width: 60%;margin: 0 auto">
          <formItem label="活动名称：">
            <Input v-model="accountItem.name" placeholder="请输入活动名称"></Input>
          </formItem>
          <formItem label="活动描述：">
             <textarea v-model="accountItem.description" rows="3" cols="20" placeholder="请输入活动描述"
                       style="width:60%"></textarea>
          </formItem>
          <formItem label="创建时间：">
            <DatePicker disabled type="datetime" placeholder="请选择时间"
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
    getActivityList,
    saveActivity,
    updateActivity,
    deleteActivity
  } from '@/api/activity'
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
            title: '活动名称',
            key: 'name',
            sortable: 'custom'
          },
          {
            title: '活动描述',
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
        disabled: true,
        params: {total: 0, page: 1, rows: 10}
      }
    },
    methods: {
      getActivity() {
        this.loading = true
        getActivityList(this.params).then(res => {
          this.params.total = res.data.total
          this.tableData = res.data.rows
          this.loading = false
          this.$refs.scroll.parentElement.scrollTop = 0
        }).catch(() => this.loading = false)
      },
      page(value) {
        this.params.page = value
        this.getActivity()
      },
      pageLimit(value) {
        this.params.rows = value
        this.getActivity()
      },
      Search() {
        this.params.page = 1
        this.getActivity()
      },
      Reset() {
        this.params = {total: 0, page: 1, rows: 10}
        this.getActivity()
      },
      refurbish() {
        this.getActivity()
      },
      onSortChange(column) {
        switch (column.order) {
          case 'normal':
            delete this.params.order
            this.getActivity()
            break
          default:
            this.params.sort = column.key
            this.params.order = column.order
            this.getActivity()
            break
        }
      },
      delRow(row) {
        this.loading = true
        deleteActivity(row.id).then(() => {
          this.getActivity()
        }).catch(() => this.loading = false)
      },
      add() {
        this.modalAdd = true
        this.accountItem = {}
      },
      addOk(accountItem) {
        this.loading = true
        accountItem.uuid = this.uuid
        saveActivity(accountItem).then(() => {
          this.getActivity()
        }).catch(() => this.loading = false)
      },
      edit(row, index) {
        this.modalEdit = true
        this.accountItem = {...this.tableData[index]}
      },
      editOk(accountItem) {
        this.loading = true
        updateActivity(accountItem).then(() => {
          this.getActivity()
        })
      }
    },
    mounted() {
      this.getActivity()
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
