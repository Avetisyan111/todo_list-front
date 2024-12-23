const createUser = new Vue({
    el: "#signup",

    data: {
        name: '',
        lastname: '',
        login: '',
        pass: '',
        msg: '',
    },

    methods: {
        createUser() {
            if (!this.name || !this.lastname || !this.login || !this.pass) { 
                alert("All fields are required!");
                return
            }
         
            let fd = new FormData();
            fd.append('name', this.name);
            fd.append('lastname', this.lastname);
            fd.append('login', this.login);
            fd.append('pass', this.pass);
        
            axios({
                url: '../back/create_user.php',
                method: 'POST',
                data: fd
            }).then(response => {
                if(response.data.result === 'success') {
                    this.msg = "You\'ve signed up successfully";
                    setTimeout( () => {window.location.href="../front/login.html"}, 1000);               
                }
            })
        }
    }

});

const loginUser = new Vue({
    el: "#login",
    
    data: {},
    
    methods: {
        loginUser() {
            if (!this.login || !this.pass) {
                alert('Login and Password are required! ');
                return;
            }

            let fd = new FormData();
            fd.append('login', this.login);
            fd.append('pass', this.pass);

            axios({
                url: "../back/login.php",
                method: "POST",
                data: fd,
            }).then(response => {
                if (response.data.result == 'success') {
                    const user_id = response.data.user_id;
                    document.coockie = `session_id=${response.data.session_id}; max-age=3600`;
                    window.location.href=`../front/home.html?id=${user_id}`;
                } else {
                    alert("Invalid login credentials.")
                }
            }).catch( error => {
                console.log("Error:",  error)
            })
        }

    }
});
        
const tasks = new Vue({
    el: "#app",

    data: {    
        title: '',
        description: '',
        attachment: null,
        task_id: '',
        is_completed: '',
        all_tasks: [],
        updated_title: '',
        updated_description: '',
        updated_attachment: null,
        updated_is_completed: '',
        successMsg: '',
        isSessionValid: false,
        user_id: '',
    },

    methods: {
    
        showModal(id) {
            this.$refs[id].show();
        },

        hideModal(id) {
            this.$refs[id].hide();    
        },

        redirectToLogin() {
            window.location.href="../front/login.html"
        },

        logOut() {
            axios({
                url: '../back/logout.php',
                method: 'GET'
            }).then(response => {
                document.cookie = "session_id=; path=/; max-age=0";
                this.redirectToLogin();
            }).catch( error => {
                console.log('Error: ', error)
            });
    
        },   

            
        async onSubmit() {
        
            if (this.title !== '' && this.description !== '') {
                let fd = new FormData();        
                fd.append('title', this.title);
                fd.append('description', this.description);
                
                try {
                    const response = await axios.post('../back/create.php', fd);
                    if (response.data.result === 'success') {                
                        this.successMsg = "Task created successfully";
                        this.title = "";
                        this.description = "";
                        this.hideModal('add-modal');
                        this.getTasks();
                    } else {
                        alert("Error! Couldn't create the Task.");
                    }
                } catch (error) {
                    console.log('Error', error);
                }
            
            } else {
                alert("Title and description fields are required!");
            }
        },
        
        async getTasks() {                
            try {
                const response = await axios.get('../back/read.php');
                this.all_tasks = response.data.rows;
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        },
                
        async editTask(id) {
        
            let fd = new FormData();
            fd.append('id', id);
            try {
                const response = await axios.post('../back/edit.php', fd);
                if (response.data.result === 'success') {
                    this.task_id = id;
                    this.updated_title = response.data.row.title;
                    this.updated_description = response.data.row.description;
                    this.showModal("update-modal");
                }    
            } catch (error) {
                console.error('Error editing task:', error);
                }
            },
            
            async deleteTask(id) {
                if (window.confirm("Are you sure you want to delete this task?")) {
                    let fd = new FormData();
                    fd.append('id', id);

                    try {
                        const response = await axios.post('../back/delete.php', fd);
                        if (response.data.result === 'success') {
                            this.successMsg = "Task was deleted successfully";
                            this.getTasks();
                        } else {
                            alert("Sorry! Task wasn't found.");
                        }
                    } catch (error) {
                        console.error('Error deleting task:', error);
                    }
                }
            },
            
            async onUpdate() {
                if (!this.task_id || !this.updated_title || !this.updated_description) {
                    alert("All fields are required!")
                }
            
                let fd = new FormData();
                fd.append('id', this.task_id);
                fd.append('title', this.updated_title);
                fd.append('description', this.updated_description);

                try {
                    const response = await axios.post('../back/update.php', fd);
                    if (response.data.result === "success") {
                        this.successMsg = "Task was updated successfully!";
                        this.task_id = '';
                        this.updated_title = "";
                        this.updated_description = "";
                        this.hideModal("update-modal");
                        this.getTasks();
                    }
                } catch (error) {
                    console.error('Error', error);
                }

            }
        },

        created() {
            this.getTasks();
            //this.checkSession();


        }

    });

