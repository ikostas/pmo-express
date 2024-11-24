const db  = require('../models');

module.exports = {
  employeeList: async (req, res) => {
    employees = await db.User.findAll()
    res.render('employees', { title: 'List of Employees', employees });
  },
  addEmployee: (req, res) => {
    res.render('addEmployee', { title: 'Add Employee' });
  },
  createEmployee: async (req, res) => {
    try {
      const formData = req.body;
      const newUser = await db.User.create(formData);
      res.status(201).redirect('/employee');
    } catch(error) {
      console.error('Error creating user:', error);
      res.status(500).send({ message: 'I tried, but I failed creating a user' }); 
    }
  },
  deleteEmployee: async (req, res) => {
    try {
    const id = req.params.id;
    const delEmployee = await db.User.destroy({ where: { id: id } });
    res.status(200).send();
    } catch(error) {
      res.status(500).json({ message: 'Error deleting row', error: error.message });
    }
  },
}
