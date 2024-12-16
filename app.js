const userAuth = new Vue({
    el: "#login",

    data: {
        name: '',
        lastname: '',
        login: '',
        password: '',     
    },

    methods: {
        create_user() {
            
        },

        check_user() {

        }
    }

});

const tasks = new Vue({
    el : "#app",

    data: {
        title: '' ,
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
    },

    methods: {
        showModal(id) 
        {
            this.$refs[id].show()
        },

        hideModal(id) 
        {
            this.$refs[id].hide()
        },

        onSubmit()
        {  
            if (this.title !== '' && this.description !== '') {
                let fd = new FormData()

                fd.append('title', this.title)
                fd.append('description', this.description)
                
                axios({
                    url: "/back/create.php",
                    method: "POST",
                    data: fd
                }).then(response => {

                    if (response.data.result == 'success') {
                        this.successMsg = "Task created successfully";
                        this.title = "";
                        this.description = "";

                        this.hideModal('add-modal')
                        this.getTasks()
                    } else {
                        alert("Error! could\'t create the Task ")
                    }
                }).catch(error => {
                    console.log(error)
                })
            } else {
                alert("Title and description fields are required !")
            }
        },

        async getTasks() {
            console.log('Fetching taksks...')
            try {
                await axios({
                    url: "/back/read.php",
                    method: 'GET',
                }).then(response => {
                    this.all_tasks = response.data.rows;
                })
            } catch (error) {
                console.error('Error fetching tasks: ', error)
            }
        },

        editTask(id)
        {
            let fd = new FormData()

            this.task_id = id

            fd.append('id', id)

            axios({
                url: "/back/edit.php",
                method: "POST",
                data: fd
            }).then(response => {
                if (response.data.result == 'success') {
                    this.updated_title = response.data.row.title;
                    this.updated_description = response.data.row.description;
                    this.showModal("update-modal");
                }
            }).catch(error => {
                console.log(error)
            })

        },

        deleteTask(id)
        {   
            if (window.confirm("Are you sure you want to delete this task ?")) {
                let fd = new FormData()

                fd.append('id', id)

                axios({
                    url: "/back/delete.php",
                    method: "POST",
                    data: fd
                }).then(response => {
                    if (response.data.result == 'success') {
                        this.successMsg = "Task was deleted successfuly";
                        this.getTasks();
                    } else {
                        alert("Sorry! task wasn't found")
                    }
                }).catch (error => {
                    console.log(error)
                })
            }
        },

        onUpdate() {
            if (this.task_id && this.updated_title !== "" && this.updated_description !== "") {
                let fd = new FormData();

                fd.append('id', this.task_id);
                fd.append('title', this.updated_title);
                fd.append('description', this.updated_description);
                
                axios({
                    url: "/back/update.php",
                    method: "POST",
                    data: fd
                }).then(response => {
                    if (response.data.result == "success") {
                        this.successMsg = "Task was updated successfully!";

                        this.task_id = "";
                        this.updated_title = "";
                        this.updated_description = "";
                        
                        this.hideModal("update-modal");
                        this.getTasks();
                    }
                })
                .catch(error => console.log('error'))
            } else {
                alert('Sorry! all fields are required')
            }
        },

        created() {
            console.log('Before mount called');
            this.getTasks();
        }
    }
});