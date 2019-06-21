<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="code">
      <Input v-model="form.code" placeholder="请输入验证码" style="width: 180px;float: left">
        <span slot="prepend">
         <Icon type="logo-codepen"/>
        </span>
      </Input>&nbsp;&nbsp;&nbsp;&nbsp;
      <img :src="image" width="70px" @click="verifyCode">
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
import {createCode} from '@/api/user'

export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          {required: true, min: 6, message: '账号不能为空且不低于6位数', trigger: 'blur'}
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          {required: true, min: 6, message: '密码不能为空且不低于6位数', trigger: 'blur'}
        ]
      }
    },
    codeRules: {
      type: Array,
      default: () => {
        return [
          {required: true, message: '请输入验证码', trigger: 'blur'}
        ]
      }
    }
  },
  data() {
    return {
      image: {},
      uuid: 'null',
      form: {
        userName: 'admin1',
        password: '123456',
        code: ''
      }
    }
  },
  computed: {
    rules() {
      return {
        userName: this.userNameRules,
        password: this.passwordRules,
        code: this.codeRules
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            userName: this.form.userName,
            password: this.form.password,
            code: this.form.code,
            uuid: this.uuid
          })
        }
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
    this.verifyCode(this.uuid)
  }
}
</script>
