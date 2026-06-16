const User = require("../models/userSchema");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 5 });

const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../utils/generateToken");
const transporter = require("../utils/transport");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const { uploadImage, deleteImage } = require("../utils/uploadImage");
const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const { FIREBASE_TYPE, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID, FIREBASE_AUTH_URI, FIREBASE_TOKEN_URI, FIREBASE_AUTH_PROVIDER_X509_CERT_URL, FIREBASE_CLIENT_X509_CERT_URL, FIREBASE_UNIVERSAL_DOMAIN, EMAIL_USER, FRONTEND_URL } = require("../config/dotenv.config");



admin.initializeApp({
  credential: admin.credential.cert({
    type: FIREBASE_TYPE,
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY,
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: FIREBASE_AUTH_URI,
    token_uri: FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
    FIREBASE_UNIVERSAL_DOMAIN : FIREBASE_UNIVERSAL_DOMAIN
  }),
});








async function deleteBlog(id) {
  try {
    // here id is blog`s id

    const blog = await Blog.findById(id);

    if (blog.likes.length > 0) {
     
      await User.updateMany(
        { _id: { $in: blog.likes } },
        { $pull: { likeBlogs: id } },
      );
    }


    if (blog.totalSaves.length > 0) {
      //    for(let i=0; i<blog.totalSaves.length; i++){
      //   let userId = blog.totalSaves[i];
      //   let user =  await User.findById(userId)

      //   if(user.savedBlogs.includes(id)){
      //      await User.findByIdAndUpdate(userId, {$pull: {savedBlogs: id}}, {new:true})

      //   }
      // }

      await User.updateMany(
        { _id: { $in: blog.totalSaves } },
        { $pull: { savedBlogs: id } },
      );
    }


    async function deleteCommentAndReplies(id) {
      let comment = await Comment.findById(id).populate({
        path: "parentComment",
        select: "_id",
      });
      for (let replyId of comment.replies) {
        await deleteCommentAndReplies(replyId);
      }

      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
          $pull: { replies: id },
        });
      }
      await Comment.findByIdAndDelete(id);
    }

    if (blog.comments.length > 0) {
      for (let i = 0; i < blog.comments.length; i++) {
        let commentId = blog.comments[i];
        await deleteCommentAndReplies(commentId);
      }
    }


    if (blog.content.blocks.length > 0) {
      let imagesToDelete = blog.content.blocks.filter(
        (block) => block.type == "image",
      );
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map((item) => deleteImage(item.data.file.imageId)),
        );
      }
    }

    if (blog.imageId) {
      await deleteImage(blog.imageId);
    }


    await Blog.findByIdAndDelete(id);

  } catch (err) {
  }
}

async function createUser(req, res) {
  try {

    let { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "please enter name",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "please enter email",
      });
    }

    let checkForExistingUser = await User.findOne({ email });
    if (checkForExistingUser) {
      if (checkForExistingUser.googleAuth) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with google, please try with google",
        });
      }

      if (checkForExistingUser.isVerify) {
        return res.status(400).json({
          success: false,
          message: "this email is already registered",
        });
      } else {
        let verificationToken = await generateJWT({
          email: checkForExistingUser.email,
          id: checkForExistingUser._id,
        });

        // verify emailcode
        async function sendEmail() {
          const sendEmail = await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: "Email Verification",
            text: "Please Verify Your Email",
            html: `<h1>Verify your email by clicking on the link</h1>
        <a href="${FRONTEND_URL}verify-email/${verificationToken}" >verify email</a>`,
          });
        }
        
        sendEmail();


        return res.status(400).json({
          success: false,
          message: "verify your email link sent on your registered email",
        });
      }
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "please enter password",
      });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username: email.split("@")[0] + randomUUID(),
      email,
      password: hashpass,
    });

    let verificationToken = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    // verify emailcode
    async function sendEmail() {
      const sendEmail = await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "Email Verification",
        text: "Please Verify Your Email",
        html: `<h1>Verify your email by clicking on the link</h1>
        <a href="${FRONTEND_URL}verify-email/${verificationToken}" >verify email</a>`,
      });
    }
     sendEmail();
    

       


    return res.status(200).json({
      success: true,
      message: "verify your email link sent on your registered email",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "please try again",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { verificationToken } = req.params;
    const verifiedUser = await verifyJWT(verificationToken);
    if (!verifiedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid token/Email expired!",
      });
    }

    const { id } = verifiedUser;

    await User.findByIdAndUpdate(id, { isVerify: true }, { new: true });
    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "please try again",
      err: err.message,
    });
  }
}

async function googleAuth(req, res) {
  try {
    const { accessToken } = req.body;
    const response = await getAuth().verifyIdToken(accessToken);
    const { name, email } = response;
    let user = await User.findOne({ email });

    if (user) {
      if (user.googleAuth) {
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });

        return res.status(200).json({
          success: true,
          message: "logged in successfully",
          user: {
            userId: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
            showLikeBlogs: user.showLikeBlogs,
            showSavedBlogs: user.showSavedBlogs,
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered without google, please try with login",
        });
      }
    }

    let newUser = await  User.create({
      name,
      email,
      username: email.split("@")[0] + randomUUID(),
      googleAuth: true,
      isVerify: true,
    });

    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "user registered successfully",
      user: {
            userId: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            bio: newUser.bio,
            profilePic: newUser.profilePic,
            showLikeBlogs: newUser.showLikeBlogs,
            showSavedBlogs: newUser.showSavedBlogs,
            token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "please try again",
      err: err.message,
    });
  }
}

async function login(req, res) {
  try {
    let { email, password } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "please enter email",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "please enter password",
      });
    }

    let checkForExistingUser = await User.findOne({ email }).select(
      "password isVerify name email profilePic username bio showLikeBlogs showSavedBlogs googleAuth",
    );
     
    if (!checkForExistingUser) {
      return res.status(400).json({
        success: false,
        message: "user not found!",
      });
    }

    if (checkForExistingUser.googleAuth) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already registered with google, please try with google",
      });
    }

    let checkForPass = await bcrypt.compare(
      password,
      checkForExistingUser.password,
    );
    if (!checkForPass) {
      return res.status(400).json({
        success: false,
        message: "user password does not matched",
        user: {
          name: checkForExistingUser.name,
          email: checkForExistingUser.email,
          username: checkForExistingUser.username,
          profilePic: checkForExistingUser.profilePic,
          bio: checkForExistingUser.bio,
        },
      });
    }

    if (!checkForExistingUser.isVerify) {
      let verificationToken = await generateJWT({
        email: checkForExistingUser.email,
        id: checkForExistingUser._id,
      });

      // verify emailcode
      async function sendEmail() {
        const sendEmail = await transporter.sendMail({
          from: EMAIL_USER,
          to: email,
          subject: "Email Verification",
          text: "Please Verify Your Email",
          html: `<h1>Verify your email by clicking on the link</h1>
        <a href="${FRONTEND_URL}verify-email/${verificationToken}" >verify email</a>`,
        });
      }
       sendEmail();






      return res.status(400).json({
        success: false,
        message: "verify your email link sent on your registered email",
      });
    }

    let token = await generateJWT({
      email: checkForExistingUser.email,
      id: checkForExistingUser._id,
    });
    return res.status(200).json({
      success: true,
      message: "user loggedin successfully",
      user: {
        userId: checkForExistingUser._id,
        name: checkForExistingUser.name,
        email: checkForExistingUser.email,
        username: checkForExistingUser.username,
        profilePic: checkForExistingUser.profilePic,
        bio: checkForExistingUser.bio,
        showLikeBlogs: checkForExistingUser.showLikeBlogs,
        showSavedBlogs: checkForExistingUser.showSavedBlogs,
        token,
      },
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "please try again",
      err: err.message,
    });
  }
}

async function getUser(req, res) {
  try {
    let user = await User.find({});
    if (!user) {
      return res.status(400).json({
        success: true,
        message: "user not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user fetched successfully",
      user,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "try again some error occurred",
      errormessage: err.message,
    });
  }
}

async function getUserByUsername(req, res) {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    let skip = (page - 1) * limit;

    let { username } = req.params;
    let actualUsername = username.split("@")[1];
    let user = await User.findOne({ username: actualUsername })
      .populate({
        path: "blogs",
      })
      .populate({
        path: "following",
        select: "name username _id profilePic",
      })
      .populate({
        path: "savedBlogs",
      })
      .populate({
        path: "likeBlogs",
      });

    let blog = await Blog.find({ creator: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    let totalBlogs = await Blog.countDocuments(
      { creator: user._id },
      { draft: false },
    );
    if (!user) {
      return res.status(404).json({
        success: true,
        message: "user not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user fetched successfully",
      user,
      blog,
      hasMore: skip + limit < totalBlogs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "try again some error occured",
      errormessage: err.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    let { userId } = req.params;
    let user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user fetched successfully!",
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "try again some error occurred",
      errormessage: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { userId } = req.params;

    const { name, username, bio } = req.body;
    const profilePic = req.file;
    
    let user = await User.findById(userId);

    if (user.username !== username) {
      let findUser = await User.findOne({ username });
      if (findUser) {
        return res.status(500).json({
          success: false,
          message: "username already exist",
        });
      }
    }

    if (req.body.profilePic !== undefined) {
      if (!JSON.parse(req.body.profilePic)) {
        if (user.profilePicId) {
          await deleteImage(user.profilePicId);
        }
        user.profilePic = null;
        user.profilePicId = null;
      }
    }

    if (profilePic) {
      if (user.profilePicId) {
        await deleteImage(user.public_id);
      }
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${profilePic.buffer.toString("base64")}`,
      );
      user.profilePic = secure_url;
      user.profilePicId = public_id;
    }
    user.name = name;
    user.username = username;
    user.bio = bio;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully!",
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "try again some error occurred",
      errormessage: err.message,
    });
  }
}

async function updateVisibilty(req, res) {
  try {
    const userId = req.user;
    const { showLikeBlogs, showSavedBlogs } = req.body;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: true,
        message: "user not found!",
      });
    }
    let updatedUser = await User.findByIdAndUpdate(userId, {
      showLikeBlogs,
      showSavedBlogs,
    });
    return res.status(200).json({
      success: true,
      message: "Updated Successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "try again some error occurred",
      errormessage: err.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = req.user;
    const { id } = req.params;
   

    if (userId != id) {
      return res.status(400).json({
        success: false,
        message: "You are not authorised to do this",
      });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    if (user.savedBlogs.length > 0) {
    

      await Blog.updateMany(
        { _id: { $in: user.savedBlogs } },
        { $pull: { totalSaves: userId } },
      );
    }


    if (user.followers.length > 0) {
      

      await User.updateMany(
        { _id: { $in: user.followers } },
        { $pull: { following: userId } },
      );
    }


    if (user.following.length > 0) {
      
     

      await User.updateMany(
        { _id: { $in: user.following } },
        { $pull: { followers: userId } },
      );
    }


    if (user.likeBlogs.length > 0) {
     

      await Blog.updateMany(
        { _id: { $in: user.likeBlogs } },
        { $pull: { likes: userId } },
      );
    }


    if (user.profilePicId) {
      await deleteImage(user.profilePicId);
    }

    // yha se likho blog delete karne ka logic

  

    await Promise.all(user.blogs.map((blogId) => deleteBlog(blogId)));

    await User.findByIdAndDelete(userId);

   
    return res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "try again some error occurred",
      errormessage: err.message,
    });
  }
}

async function followCreator(req, res) {
  try {
    let { creatorId, userId } = req.params;

    let creator = await User.findById(creatorId);

    if (!creator.followers.includes(userId)) {
      await User.findByIdAndUpdate(
        creatorId,
        { $push: { followers: userId } },
        { new: true },
      );
      await User.findByIdAndUpdate(
        userId,
        { $push: { following: creatorId } },
        { new: true },
      );
      return res.status(200).json({
        success: true,
        message: "following",
      });
    } else {
      await User.findByIdAndUpdate(
        creatorId,
        { $pull: { followers: userId } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        userId,
        { $pull: { following: creatorId } },
        { new: true },
      );
      return res.status(200).json({
        success: true,
        message: "Unfollowing",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "try again some error occurred",
      errormessage: error.message,
    });
  }
}
module.exports = {
  createUser,
  getUser,
  getUserByUsername,
  getUserById,
  updateUser,
  deleteUser,
  login,
  verifyEmail,
  googleAuth,
  followCreator,
  updateVisibilty,
};
