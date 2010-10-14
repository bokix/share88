(function($) {
	SinaApi = {
		update:function(msg,completeCallBack){
			var _data = {
				status : msg,
				source : app_source
			};
			var user = Util.getObjData("allUserData")['sina'];
			$.ajax({
				url : sinaURL.update,
				cache : false,
				timeout : 60 * 1000, 
				type : "post",
				data : _data,
				async : false,
				dataType : 'json',
				beforeSend : function(req) {
					req.setRequestHeader('Authorization', Util.makeBasicAuth(
									user.loginName, user.passWord));
				},
				complete:completeCallBack
			});
		}
	};
	
	var app_source = "1223946471";
	var domain_sina = 'http://t.sina.com.cn';
	var api_domain_sina = 'http://api.t.sina.com.cn';
	
	var sinaURL = {    
        public_timeline:        api_domain_sina + '/statuses/public_timeline.json',
        friends_timeline:       api_domain_sina + '/statuses/friends_timeline.json',
        comments_timeline:      api_domain_sina + '/statuses/comments_timeline.json',
        user_timeline:          api_domain_sina + '/statuses/user_timeline.json',
        mentions:               api_domain_sina + '/statuses/mentions.json',
        favorite:               api_domain_sina + '/favorite.json',
        favorites_create:       api_domain_sina + '/favorites/create.json',
        favorites_destroy:      api_domain_sina + '/favorites/destroy/{id}.json',
        counts:                 api_domain_sina + '/statuses/counts.json',
        update:                 api_domain_sina + '/statuses/update.json',
        upload:                 api_domain_sina + '/statuses/upload.json',
        repost:                 api_domain_sina + '/statuses/repost.json',
        comment:                api_domain_sina + '/statuses/comment.json',
        comment_destroy:        api_domain_sina + '/statuses/comment_destroy/{id}.json',
        comments:               api_domain_sina + '/statuses/comments.json',
        destroy:                api_domain_sina + '/statuses/destroy.json',
        destroy_msg:            api_domain_sina + '/direct_messages/destroy/{id}.json',
        direct_messages:        api_domain_sina + '/direct_messages.json',
        new_message:            api_domain_sina + '/direct_messages/new.json',
        verify_credentials:     api_domain_sina + '/account/verify_credentials.json',
        detailUrl:        domain_sina + '/jump?aid=detail&twId=',
        searchUrl:        domain_sina + '/search/'
	};
})(jQuery);
