<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    v-form
      Aspect(v-for="a of aspects" :aspect="a" :value.sync="a.value" mode="edit" :key="a.name")
    v-btn(@click='login' color='success' autofocus) Login
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>
    import {initialize} from "../lib/client";

    import {LOGIN_ALREADY_LOGGED_IN} from "~~/lib/consts"
    import Aspect from "../components/Aspect";
    import {unpack} from "../lib/aspect";
    import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";

    export default {
        name: "Login",
        mixins: [TriggerSnackbarMixin],
        components: {Aspect},
        data() {
            return {
                aspects: [{
                    type: "str",
                    name: "Username",
                    attr: {
                        max: 30,
                    },
                    value: {
                        value: ""
                    }
                },
                    {
                        type: "str",
                        name: "Password",
                        attr: {
                            max: 40,
                        },
                        value: {
                            value: ""
                        },
                    }
                ],
                username: "",
                password:
                    "",
                errorMsg:
                    ""
            }
        }
        ,
        methods: {
            login() {
                this.$axios.post("/login", {
                    username: unpack(this.aspects[0].value),
                    password: unpack(this.aspects[1].value),
                }).then(({data}) => {
                    if (data.status || data.msg_ === LOGIN_ALREADY_LOGGED_IN) {
                        //console.log("LOGGIN DONE")
                        initialize(this.$axios, this.$store).then((res) => {
                        });
                        this.$store.commit("user/login", data.result);
                        // todo test, what is coming back...
                        this.$router.push("/");
                        this.snackbar(data.status === true, "You are logged in")
                    } else {
                        this.errorMsg = data.msg;
                    }
                }).catch((err) => {
                    console.log("err", err)
                })
            }
        }
    }
</script>

<style scoped>

</style>
