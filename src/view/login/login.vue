<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <div style="text-align: right">
            <a class="login-tip" @click="rePassword">忘记密码&nbsp;&nbsp;&nbsp;</a>
            <a class="login-tip" @click="openCreateForm">免费注册&nbsp;&nbsp;&nbsp;</a>
          </div>
        </div>
        <!-- 账号注册页面 -->
        <Modal v-draggable="options" title="账号注册" width="600"/>
        <Modal v-model="createCustomer" v-draggable="options" :mask-closable="false" title="账号注册" width="600">
          <div class="form-con">
            <p style="text-align: center;font-size: 20px;height: 60px;">欢迎注册我也不知道想做啥系统</p>
            <Form ref="createForm" :model="createForm" :rules="rules" :label-width="80"
                  @keydown.enter.native="handleCreate" style="width: 60%;margin: 0 auto">
              <FormItem prop="userName" label="账号">
                <Input v-model="createForm.userName" placeholder="请输入账号">
                <span slot="prepend">
                  <Icon :size="16" type="ios-person"></Icon>
                </span>
                </Input>
              </FormItem>
              <FormItem prop="password" label="密码">
                <Input type="password" v-model="createForm.password" placeholder="请输入密码">
                <span slot="prepend">
                  <Icon :size="14" type="md-lock"></Icon>
                </span>
                </Input>
              </FormItem>
              <FormItem prop="validPassword" label="确认密码">
                <Input type="password" v-model="createForm.validPassword" placeholder="请重新输入密码">
                <span slot="prepend">
                  <Icon :size="14" type="md-lock"></Icon>
                </span>
                </Input>
              </FormItem>
              <FormItem prop="email" label="邮箱">
                <Input v-model="createForm.email" placeholder="请输入邮箱">
                <span slot="prepend">
                  <Icon :size="16" type="md-mail"></Icon>
                </span>
                </Input>
              </FormItem>
              <FormItem prop="phone" label="手机号">
                <Input v-model="createForm.phone" placeholder="请输入手机号">
                <span slot="prepend">
                  <Icon :size="16" type="ios-call"></Icon>
                </span>
                </Input>
              </FormItem>
              <FormItem prop="code">
                <Input v-model="createForm.code" placeholder="请输入验证码" style="width: 180px;float: left">
                  <span slot="prepend">
                    <Icon type="logo-codepen"/>
                  </span>
                </Input>&nbsp;&nbsp;
                <img :src="image" width="70px" @click="verifyCode">
              </FormItem>
            </Form>
          </div>
          <div slot="footer">
            <Button size="large" type="primary" :loading="loading" long @click="handleCreate">注册</Button>
          </div>
        </Modal>
      </Card>
    </div>
  </div>
</template>

<script>
  import LoginForm from '_c/login-form'
  import {mapActions} from 'vuex'
  import {addCustomer} from '@/api/customer'
  import {createCode} from '@/api/user'

  export default {
    components: {
      LoginForm
    },
    data() {
      const validPassword = (rule, value, callback) => {
        if (value !== this.createForm.password) {
          console.log(value)
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }
      return {
        options: {
          trigger: '.ivu-modal-header',
          body: '.ivu-modal',
          recover: true
        },
        createCustomer: false,
        createForm: {
          userName: '',
          password: '',
          validPassword: '',
          email: '',
          phone: '',
          code: ''
        },
        loading: false,
        image: {},
        uuid: 'null',
        code: '',
        rules: {
          userName: [
            {required: true, min: 6, message: '请输入账号，账号长度不低于6位数', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {type: 'string', min: 6, message: '密码长度不能低于6位数', trigger: 'blur'}
          ],
          validPassword: [
            {required: true, message: '请确认密码', trigger: 'blur'},
            {type: 'string', min: 6, message: '确认密码长度不能低于6位数', trigger: 'blur'},
            {validator: validPassword, message: '密码不一致', trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          phone: [
            {pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '验证码不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      ...mapActions([
        'handleLogin',
        'getUserInfo'
      ]),
      verifyCode() {
        createCode(this.uuid).then(res => {
          this.image = "data:img/jpg;base64," + res.data.image
          this.uuid = res.data.uuid
        })
      },
      handleSubmit({userName, password, code, uuid}) {
        this.handleSpin()
        this.handleLogin({userName, password, code, uuid}).then(res => {
          if (res.data.token) {
            this.$router.push({
              name: this.$config.homeName
            })
          }
        }).then(() => this.$Spin.hide()).catch(() => this.$Spin.hide())
      },
      openCreateForm() {
        this.verifyCode(this.uuid)
        this.$refs.createForm.resetFields()
        this.createCustomer = true
      },
      handleCreate() {
        this.$refs.createForm.validate((valid) => {
          if (valid) {
            this.loading = true
            this.createForm.uuid = this.uuid
            addCustomer(this.createForm).then(res => {
              this.loading = false
              this.createCustomer = false
            }).catch(() => {
              this.loading = false
              this.$Spin.hide()
            })
          }
        })
      },
      rePassword() {
        this.$Message.info("不好意思，此功能我没做")
      },
      handleSpin() {
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
    }
  }
</script>

<style>
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
</style>
