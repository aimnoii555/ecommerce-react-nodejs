const exporess = require('express')
const app = exporess()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')

// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')

// middleware
app.use(morgan('dev'))
app.use(exporess.json({
    limit: '20mb'
}))
app.use(cors())
// app.use('/api',authRouter)
// app.use('/api',categoryRouter)

readdirSync('./routes').map((e) => {
     app.use('/api',require('./routes/'+e))
})

app.listen(3000,()=>{
    console.log('Server is running port 3000.');
})
