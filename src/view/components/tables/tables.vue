<template>
  <div ref="scroll">
    <Card>
      <div class="search-con search-con-top" ref="searchForm">
        <Select v-model="searchKey" class="search-col">
          <Option v-for="item in columns" v-if="item.key !== 'ids' & item.key !== 'action'" :value="item.key" :key="`search-col-${item.key}`">{{ item.title }}</Option>
        </Select>
        <Input @on-change="handleClear" clearable placeholder="输入关键字搜索" class="search-input" v-model="searchValue"/>
        <Button @click="handleSearch" class="search-btn" type="primary"><Icon type="ios-search"/>&nbsp;&nbsp;搜索</Button>
        <div style="float: right;text-align: right">
          <Button @click="batchAdd" class="search-btn" type="primary"><Icon type="md-add"/>&nbsp;&nbsp;批量添加</Button>&nbsp;
          <Button @click="handleAdd" class="search-btn" type="primary"><Icon type="md-add"/>&nbsp;&nbsp;添加设备</Button>
        </div>
      </div>
      <Table ref="tables" :loading="loading" :data="tableData" :columns="columns" @on-selection-change="selectionChange"
             @search-form="handleSearch" class="table" @on-sort-change="onSortChange">
        <template slot="action" slot-scope="{row,index}">
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
        <Page :total="params.pageTotal" :current="params.pageNum" :page-size="params.pageSize" show-sizer show-elevator
              show-total
              @on-change="handlePage" @on-page-size-change='handlePageSize'/>
      </div>
      <!-- 添加页面的Modal -->
      <Modal v-draggable="options" title="添加" width="600"/>
      <Modal v-model="modalAdd" v-draggable="options" @on-ok="addOk" :mask-closable="false" title="添加" width="600">
        <p slot="header">
          <span>添加&nbsp;&nbsp;</span>
          <Icon type="md-cloud-upload"/>
        </p>
        <Alert show-icon style="width: 90%;margin: 0 auto;font-size: 14px;line-height: 2em">
          特别说明：deviceName可以为空,当为空时,系统将会颁发全局唯一标识符作为deviceName。
        </Alert>
        <Form :model="addItem" :label-width="80" style="margin-top: 10px">
          <formItem>
            <p style="font-size: 16px">产品:</p>
            <Input v-model="addItem.product" placeholder="请选择产品" style="width: 70%"></Input>
          </formItem>
          <formItem>
            <p style="font-size: 16px">deviceName:</p>
            <Input v-model="addItem.deviceName" placeholder="支持英文字母、数字和特殊字符-_@.:，长度限制4~32" style="width: 70%"></Input>
          </formItem>
        </Form>
      </Modal>
      <!-- 批量添加页面的Modal -->
      <Modal v-draggable="options" title="批量添加" width="600"/>
      <Modal v-model="modalBatchAdd" v-draggable="options" @on-ok="batchAddOk" :mask-closable="false" width="600">
        <p slot="header">
          <span>批量添加&nbsp;&nbsp;</span>
          <Icon type="md-cloud-upload"/>
        </p>
        <Form :model="batchItem" :label-width="80">
          <formItem>
            <p style="font-size: 16px">产品:</p>
            <Input v-model="batchItem.product" placeholder="请选择产品" style="width: 60%"></Input>
          </formItem>
          <formItem>
            <p style="font-size: 16px">deviceName:</p>
            <Input v-model="batchItem.deviceName" placeholder="支持英文字母、数字和特殊字符-_@.:，长度限制4~32" style="width: 60%"></Input>
          </formItem>
        </Form>
      </Modal>
      <!-- 编辑页面的Modal -->
      <Modal v-draggable="options" title="编辑" width="600"/>
      <Modal v-model="modalEdit" v-draggable="options" @on-ok="editOk" :mask-closable="false" title="编辑" width="600">
        <Form :model="editItem" :label-width="80" inline>
          <formItem label="姓名：">
            <Input v-model="editItem.name" placeholder="Enter something..."></Input>
          </formItem>
          <formItem label="productKey：" style="margin-left: 30px">
            <Input v-model="editItem.productKey" placeholder="Enter something..."></Input>
          </formItem>
          <formItem label="类型：">
            <Input v-model="editItem.type" placeholder="Enter something..."></Input>
          </formItem>
          <formItem label="总数：" style="margin-left: 30px">
            <Input v-model="editItem.total" placeholder="Enter something..."></Input>
          </formItem>
          <formItem label="日期：">
                <DatePicker confirm type="datetime" placeholder="Select date" v-model="editItem.createTime"></DatePicker>
          </formItem>
        </Form>
      </Modal>
    </Card>
  </div>
</template>

<script>
import Tables from '_c/tables'
import {getTableData} from '@/api/data'
import {callback} from '@/common/callback'

export default {
  name: 'tables_page',
  components: {
    Tables
  },
  data () {
    return {
      options: {
        trigger: '.ivu-modal-header',
        body: '.ivu-modal',
        recover: true
      },
      columns: [
        {key: 'ids', type: 'selection', width: 60, align: 'center', value: 50},
        {title: 'Name', key: 'name', sortable: 'custom'},
        {title: 'productKey', key: 'productKey', editable: true},
        {title: '类型', key: 'type'},
        {title: '总数', key: 'total'},
        {title: '创建时间', key: 'createTime', sortable: 'custom'},
        {title: '操作', key: 'action', slot: 'action', align: 'center', width: 170}
      ],
      loading: true,
      modalEdit: false,
      modalAdd: false,
      modalBatchAdd: false,
      editItem: {},
      addItem: {},
      batchItem: {},
      tableData: [],
      selections: [],
      searchValue: '',
      searchKey: '',
      params: {pageTotal: 0, pageNum: 1, pageSize: 10}
    }
  },
  methods: {
    delRow (row) {
      let id = row.id
      console.log(id)
      this.tableData.splice(row._index, 1)
      this.$nextTick(() => {
        this.act = !this.act
      })
    },
    edit (row, index) {
      this.modalEdit = true
      console.log()
      this.editItem = { ...this.tableData[index] }
    },
    editOk () {
      console.log(this.editItem)
    },
    handleAdd () {
      this.modalAdd = true
    },
    addOk () {
      console.log(this.addItem)
    },
    batchAdd () {
      this.modalBatchAdd = true
    },
    batchAddOk () {
      console.log(this.batchItem)
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.loading = true
        this.$refs.scroll.parentElement.scrollTop = 0
        getTableData(this.params).then(res => {
          this.tableData = res.data.tableData
          this.params = res.data.params
          this.loading = false
        })
      }
    },
    handlePage (value) {
      this.params.pageNum = value
      this.loading = true
      this.$refs.scroll.parentElement.scrollTop = 0
      getTableData(this.params).then(res => {
        this.tableData = res.data.tableData
        this.params = res.data.params
        this.loading = false
      })
    },
    handlePageSize (value) {
      this.params.pageSize = value
      this.loading = true
      this.$refs.scroll.parentElement.scrollTop = 0
      getTableData(this.params).then(res => {
        this.tableData = res.data.tableData
        this.params = res.data.params
        this.loading = false
      })
    },
    handleSearch () {
      if (this.searchKey === '') {
        userSearch(this.params).then(res => {
          console.log(res)
        })
        this.$Message.warning('请选择搜索条件')
      } else {
        this.loading = true
        this.params[this.searchKey] = this.searchValue
        getTableData(this.params).then(res => {
          this.tableData = res.data.tableData
          delete this.params[this.searchKey]
          this.loading = false
        })
      }
    },
    onSortChange (column) {
      getMenu().then(res => {
        console.log(res.data)
      })
      if (column.order === 'normal') {
        console.log(column.key)
      } else {
        console.log(column)
      }
    },
    selectionChange (selection) {
      this.selections = selection.map(s => s.id)
    }
  },
  mounted () {

  }
}
</script>

<style>
  .table td{
    height: 70px;
  }
</style>
