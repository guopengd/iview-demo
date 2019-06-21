<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <div style="float: left">
          <Button @click="deleteBatch" class="search-btn" type="warning">批量删除</Button>
          &nbsp;&nbsp;账号：
          <Input clearable v-model="params.username" placeholder="请输入账号名" style="width: 100px"/>
          &nbsp;&nbsp;注解描述：
          <Input clearable v-model="params.options" placeholder="请输入手机号码" style="width: 100px"/>
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
          <Button @click="refurbish" class="search-btn" style="font-weight: bold">刷新</Button>
        </div>
      </div>
      <Table :data="tableData" :columns="columns" @search-form="Search" class="table"
             @on-selection-change="selectionChange" @on-sort-change="onSortChange">
        <template slot="method" slot-scope="{row,index}">
          <Tooltip max-width="300" :content="row.method">
            <Button>查看方法</Button>
          </Tooltip>
        </template>
        <template slot="params" slot-scope="{row,index}">
          <Tooltip max-width="300" :content="row.params">
            <Button>查看参数</Button>
          </Tooltip>
        </template>
        <template slot="action" slot-scope="{row,index}">
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
    listLog,
    deleteLog,
    deleteBacthLog
  } from '@/api/system'
  import {formatDate} from '@/common/Format'

  export default {
    name: 'menus',
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
            key: 'ids',
            type: 'selection',
            width: 60,
            align: 'center',
            value: 50
          },
          {
            title: '账号',
            key: 'username',
            sortable: 'custom'
          },
          {
            title: '注解描述',
            key: 'operation',
            tooltip: true
          },
          {
            title: '方法',
            key: 'method',
            slot: 'method'
          },
          {
            title: '参数',
            key: 'params',
            slot: 'params'
          },
          {
            title: 'ip地址',
            key: 'ip',
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
            align: 'center'
          }
        ],
        loading: true,
        tableData: [],
        selections: [],
        searchValue: '',
        searchKey: '',
        params: {total: 0, page: 1, rows: 10}
      }
    },
    methods: {
      getLog() {
        this.loading = true
        listLog(this.params).then(res => {
          this.params.total = res.data.total
          this.tableData = res.data.rows
          this.loading = false
          this.$refs.scroll.parentElement.scrollTop = 0
        }).catch(() => this.loading = false)
      },
      page(value) {
        this.params.page = value
        this.getLog()
      },
      pageLimit(value) {
        this.params.rows = value
        this.getLog()
      },
      Search() {
        this.params.page = 1
        this.getLog()
      },
      Reset() {
        this.params = {total: 0, page: 1, rows: 10}
        this.getLog()
      },
      refurbish() {
        this.getLog()
      },
      onSortChange(column) {
        switch (column.order) {
          case 'normal':
            delete this.params.order
            this.getLog()
            break
          default:
            this.params.sort = column.key
            this.params.order = column.order
            this.getLog()
            break
        }
      },
      delRow(row) {
        this.loading = true
        deleteLog(row.id).then(() => {
          this.getLog()
        }).catch(() => this.loading = false)
      },
      selectionChange(selection) {
        this.selections = selection.map(s => s.id)
      },
      deleteBatch() {
        this.loading = true
        deleteBacthLog(this.selections).then(() => {
          this.getLog()
        }).catch(() => this.loading = false)
      }
    },
    mounted() {
      this.getLog()
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
