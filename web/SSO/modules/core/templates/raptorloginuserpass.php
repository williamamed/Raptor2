<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>SAML Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="../../../../bundles/System/Login/css/all.css" rel="stylesheet">
    <!-- Custom styles -->
    

    <!-- Le styles -->
 
    <link href="../../../../bundles/Raptor2/Syntarsus/Login/css/boo.css" rel="stylesheet">
    <link href="../../../../bundles/Raptor2/Syntarsus/Login/css/boo-coloring.css" rel="stylesheet">
   <link href="../../../../bundles/Raptor2/Syntarsus/Login/css/login.css" rel="stylesheet">
   <link href="../../../../bundles/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  
   <style type="text/css">
    .signin-content {
      max-width: 360px;
      margin: 0 auto 20px;
    }
    body {
	/*background:#3d71b8 url(../../../extjs/desktop/images/portal.jpg) repeat left top;*/
        background: url(/<?php echo $this->data['baseurlpath']; ?>resources/syn.png);
        background-attachment: fixed;
        background-size: 100% 100%;
   
	
	overflow: hidden;
	height: 100%;
    }
    </style>

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="../assets/js/html5shiv.js"></script>
    <![endif]-->

    <!-- Fav and touch icons -->
   <link rel="icon" type="image/icon" href="/<?php echo $this->data['baseurlpath']; ?>resources/icons/favicon.ico" />
  </head>

  <body class="signin signin-vertical" >
<div class="page-container">
    
    <!-- // header-container -->
    
    <div id="main-container">
        <div id="main-content" class="main-content container">
            <h3 class="form-signin-heading text-center" style="margin-bottom: 20px;"><?php echo $this->t('{login:user_pass_header}'); ?></h3>
            <?php
                if ($this->data['errorcode'] !== NULL) {
                ?>
                       <h5 class="form-signin-heading text-center"  style="color: #990000"><img src="/<?php echo $this->data['baseurlpath']; ?>resources/icons/experience/gtk-dialog-error.48x48.png"  style="margin: 15px " /><?php echo $this->t('{login:error_header}'); ?></h5>
                <?php
                }
                ?>
            <div class="signin-content" >
                
                
                
                <div class="">
                    <div class="tab-content overflow">
                        <div class="tab-pane fade in active" id="login">
                           
                            <form class="form-tied margin-00" method="post" action="?" name="f">
                                <fieldset>
                                    <ul style="padding-left: 0px;">
                                        <li>
                                           
                                            <?php
                                            if ($this->data['forceUsername']) {
                                                    echo '<strong style="font-size: medium">' . htmlspecialchars($this->data['username']) . '</strong>';
                                            } else {
                                                    echo '<input type="text" id="username" placeholder="'.$this->t('{login:username}').'" class="input-block-level" style="background: white;" tabindex="1" name="username" value="' . htmlspecialchars($this->data['username']) . '" />';
                                            }
                                            ?>
                                            
                                            
                                        </li>
                                        <li>
                                            <input id="idPassword" class="input-block-level" style="background: white;" type="password" name="password" placeholder="<?php echo $this->t('{login:password}');?>">
                                        </li>
                                    </ul>
                                    <hr class="margin-xm">
                                    <label class="checkbox pull-left">
                                        <?php
                                            if ($this->data['rememberUsernameEnabled'] || $this->data['rememberMeEnabled']) {
                                                if ($this->data['rememberUsernameEnabled']) {
                                                    echo str_repeat("\t", 4);
                                                    echo '<input type="checkbox" id="remember_username" tabindex="4" name="remember_username" value="Yes" ';
                                                    echo ($this->data['rememberUsernameChecked'] ? 'checked="Yes" /> ' : '/> ');
                                                    echo $this->t('{login:remember_username}');
                                                }
                                                if ($this->data['rememberMeEnabled']) {
                                                    echo str_repeat("\t", 4);
                                                    echo '<input type="checkbox" id="remember_me" tabindex="4" name="remember_me" value="Yes" ';
                                                    echo $this->data['rememberMeChecked'] ? 'checked="Yes" /> ' : '/> ';
                                                    echo $this->t('{login:remember_me}');
                                                }
                                            } 
                                            ?>
                                    </label>
                                    <br>
                                    <?php
                                        foreach ($this->data['stateparams'] as $name => $value) {
                                                echo('<input type="hidden" name="' . htmlspecialchars($name) . '" value="' . htmlspecialchars($value) . '" />');
                                        }
                                        ?>
                                    <div class="margin-xxx clearfix"></div>
                                    <button id="regularsubmit" type="submit" class="btn btn-block btn-large btn-primary" ><?php echo $this->t('{login:login_button}'); ?></button>
                                </fieldset>
                                <hr class="margin-sm">
                            </form>
                            <!-- // form --> 
                            
                        </div>
                        <!-- // Tab Login -->
                        
                        
                        <!-- // Tab Forgot --> 
                        
                    </div>
                </div>
                <!-- // Well-Black --> 
                
           
                <div class="web-description">
                    <img src="/<?php echo $this->data['baseurlpath']; ?>resources/icons/ssplogo-fish-small.png"  style="margin: 15px;margin-right: 0px; " /><img src="../../../../bundles/Raptor/ico/raptor-32.png" width="50" style="margin: 15px ;margin-left: 5px;" /><br>
                    <h5>Copyright &copy; 2015 </h5>
                    
                </div>
              
            </div>
            <!-- // sign-content -->
          <?php 
	
	$includeLanguageBar = TRUE;
	if (!empty($_POST)) 
		$includeLanguageBar = FALSE;
	if (isset($this->data['hideLanguageBar']) && $this->data['hideLanguageBar'] === TRUE) 
		$includeLanguageBar = FALSE;
	
	if ($includeLanguageBar) {
		
		$languages = $this->getLanguageList();
		if ( count($languages) > 1 ) {
			echo '<div id="languagebar">';
			$langnames = array(
						'no' => 'Bokmål', // Norwegian Bokmål
						'nn' => 'Nynorsk', // Norwegian Nynorsk
						'se' => 'Sámegiella', // Northern Sami
						'sam' => 'Åarjelh-saemien giele', // Southern Sami
						'da' => 'Dansk', // Danish
						'en' => 'English',
						'de' => 'Deutsch', // German
						'sv' => 'Svenska', // Swedish
						'fi' => 'Suomeksi', // Finnish
						'es' => 'Español', // Spanish
						'fr' => 'Français', // French
						'it' => 'Italiano', // Italian
						'nl' => 'Nederlands', // Dutch
						'lb' => 'Lëtzebuergesch', // Luxembourgish
						'cs' => 'Čeština', // Czech
						'sl' => 'Slovenščina', // Slovensk
						'lt' => 'Lietuvių kalba', // Lithuanian
						'hr' => 'Hrvatski', // Croatian
						'hu' => 'Magyar', // Hungarian
						'pl' => 'Język polski', // Polish
						'pt' => 'Português', // Portuguese
						'pt-br' => 'Português brasileiro', // Portuguese
						'ru' => 'русский язык', // Russian
						'et' => 'eesti keel', // Estonian
						'tr' => 'Türkçe', // Turkish
						'el' => 'ελληνικά', // Greek
						'ja' => '日本語', // Japanese
						'zh' => '简体中文', // Chinese (simplified)
						'zh-tw' => '繁體中文', // Chinese (traditional)
						'ar' => 'العربية', // Arabic
						'fa' => 'پارسی', // Persian
						'ur' => 'اردو', // Urdu
						'he' => 'עִבְרִית', // Hebrew
						'id' => 'Bahasa Indonesia', // Indonesian
						'sr' => 'Srpski', // Serbian
						'lv' => 'Latviešu', // Latvian
						'ro' => 'Românește', // Romanian
						'eu' => 'Euskara', // Basque
			);
			
			$textarray = array();
			foreach ($languages AS $lang => $current) {
				$lang = strtolower($lang);
				if ($current) {
					$textarray[] = $langnames[$lang];
				} else {
					$textarray[] = '<a href="' . htmlspecialchars(SimpleSAML_Utilities::addURLparameter(SimpleSAML_Utilities::selfURL(), array($this->languageParameterName => $lang))) . '">' .
						$langnames[$lang] . '</a>';
				}
			}
			echo join(' | ', $textarray);
			echo '</div>';
		}

	}



	?>  <br>
       <h6 class="muted text-center">This template is proportioned by Raptor</h6>
       <h6 class="muted text-center">Please edit this template in: web/SSO/simplesamlphp/modules/core/template/raptorloginuserpass.php</h6><br>
       
        </div>
        <!-- // main-content --> 
        
    </div>
    <!-- // main-container  --> 
    
</div>

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
   
    <script src="../../../../bundles/bootstrap/js/all.js"></script>
   
     <script type="text/javascript">
        $(document.body).ready(function(){
           
            
           /* $('#btn-send').click(function(){
                 $(this).attr({disabled:true});
                 $('form').submit();
            })*/
        });
        
        </script>
  </body>
</html>
