/**
 * Created by stevoperisic on 4/23/17.
 */

$('document').ready(function(){
    console.log('ready');

    // ?
    $.ajax({
        method: 'GET',
        url: 'https://developer.athenahealth.com/io-docs/getoauth2accesstoken',
        data: {
            apiId: 784,
            auth_flow: 'client_cred',
            client_id: 'dcxt88kxxv8kw5hg75h5wy5f',
            client_secret: '8pkzSgzMXcqqsC8'
        }
    }).then(function(data){
        console.log(data);
    }).catch(function(err){
        console.error(err)
    })
});