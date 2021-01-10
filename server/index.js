const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");



//application.x-www-formurlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
	useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('MongoDB Connected...'))
	.catch(err=>console.log(err))


app.get('/', (req, res) => {
	res.send('Hello David!')
})

app.get('/api/hello', (req, res) => {
	res.send("안뇽")
})


app.post('/api/users/register', (req, res) => {
	console.log('Someone is Signing Up, Sir')
	//회원가입할때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.
	const user = new User(req.body)
	
	user.save((err, userInfo) => {
		if(err) return res.json({success: false, err})
		return res.status(200).json({
			success: true
		})
	})
})


app.post('/api/users/login', (req, res) => {
	
	console.log('Someone is Signing In')
	//요청된 이메일을 데이터베이스에 있는지 찾는다.
	User.findOne({ email: req.body.email }, (err, user) => {
		
		console.log('user', user)
		console.log('Comparing Email')
		if(!user){
			console.log('No Email Data')
			return res.json({
				loginSuccess: false,
				message: "제공된 이메일에 해당하는 유저가 없습니다."
			})
		}
		
		console.log('Email Found')
		
		//요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
		user.comparePassword(req.body.password, (err, isMatch) => {
			if(err) throw err;
			console.log('Comparing Password')
			if(!isMatch) {
				console.log('Wrong Password')
				return res.json({
					loginSuccess: false, 
					message: "비밀번호가 틀렸습니다."
				})
			}
			console.log('Password Identical')
			//비밀번호까지 맞다면 토큰을 생성하기
			user.generateToken((err, user) => {
				console.log('Token is Generated')
				if (err) return res.status(400).send(err);
				
				// token을 저장한다. 어디에? 쿠키, 로컬스토리지, 등
				res.cookie("x_auth", user.token)
				.status(200)
				.json({loginSuccess: true, userId: user._id})
			})
		})
	})
})



app.get('/api/users/auth', auth , (req, res) => {
	
	// 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 말
	res.status(200).json({
		_id: req.user._id,
		isAdmin: req.user.role === 0 ? false : true,
		isAuth: true,
		email: req.user.email,
		name: req.user.name,
		role: req.user.role,
		image: req.user.image
	})
})



app.get('/api/users/logout', auth, (req, res) => {
	console.log(req.user._id + " is logging out")
	User.findOneAndUpdate(
		{_id: req.user._id},
		{token: ""},
		(err, user) => {
			if(err) return res.json({success: false, err});
			return res.status(200).send({
				success: true
			})
		}
	)
})



app.listen(port, () => {
  console.log(`Example app listening at https://nodeandreact.run.goorm.io with the port number: ${port}`)
})