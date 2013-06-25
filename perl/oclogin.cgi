#!/usr/bin/perl

#BEGIN{ $| = 1; print "Content-type: text/html\n\n"; open(STDERR, ">&STDOUT"); }

use utf8;
use CGI;

# path
$path_user = "../dat/user/user.txt";
$path_temp = "../dat/user/user.tmp";

# system date
($mday,$mon,$year) = (localtime(time))[3..5];
$year += 1900;
$mon += 1;
$sysdate = $year."-".$mon."-".$mday;

# form data
my $cgi = new CGI;
%params = $cgi->Vars;

# return value
$ret_dat = "";

# =============[ LOGIN ]===============
if($params{"LOGCMD"} eq "LOGIN"){
	if ($params{"USERID"} ne "" && $params{"USERPW"} ne ""){
		### open flock bimode ####
		open(IN, $path_user);
		flock(IN, 1);
		@logdat = <IN>;
		foreach (@logdat) {
			if ($_ =~ /^\Q$params{"USERID"}\E\{\}\Q$params{"USERPW"}\E\{\}/){
				# ID,NAME
				@col = split("{}", $_);
				$ret_dat = "LOGIN,".$col[0].",".$col[2].",".$col[4].",".$col[5].",".$col[6].",".$col[7].",".$col[8].",".$col[9];
				last;
			}
		}
		close(IN);
		if($ret_dat eq ""){
			$ret_dat = "ERROR,LOGIN2";
		}
	}else{
		$ret_dat = "ERROR,LOGIN";
	}
}
# =============[ ENTRY ]===============
if($params{"LOGCMD"} eq "ENTRY"){
	### open flock bimode ####
	open(IN, $path_user);
	flock(IN, 1);
	@logdat = <IN>;
	foreach (@logdat) {
		if ($_ =~ /^\Q$params{"ENTRYID"}\E\{\}/){
			$ret_dat = "ERROR,ENTRY";
			last;
		}
	}
	close(IN);

	if($ret_dat eq ""){
		### open flock bimode ####
		open(OUT, ">> $path_user");  # 追加モードで開く
		flock(OUT, 2);               # ロック確認。ロック
		print OUT $params{"ENTRYID"}."{}".$params{"ENTRYPW"}."{}".$params{"ENTRYNAME"}."{}DT0001{}0{}piece1{}1500{}0{}1500{}0{}$sysdate\n";  # 書き込む
		close(OUT);                  # closeすれば自動でロック解除
		# ID,NAME
		$ret_dat = "LOGIN,".$params{"ENTRYID"}.",".$params{"ENTRYNAME"}.",0,piece1,1500,0,1500,0";
	}
}
# =============[ UPDATE ]===============
if($params{"LOGCMD"} eq "UPDATE"){
	### open flock bimode ####
	open(IN, $path_user);
	flock(IN, 1);
	@logdat = <IN>;
	### open flock bimode ####
	open(OUT, ">> $path_temp");
	flock(OUT, 2);
	foreach (@logdat) {
		$log_line = $_;
		if ($log_line =~ /^\Q$params{"USERID"}\E\{\}/){
			@col = split("{}", $log_line);
			if($params{"PIECE"} ne ""){
				$col[5] = $params{"PIECE"};
			}
			if($params{"RATE"} ne ""){
				$col[6] = $params{"RATE"};
				$col[7] += 1;
			}
			if($params{"RATE2"} ne ""){
				$col[8] = $params{"RATE2"};
				$col[9] += 1;
			}
			print OUT join("{}", @col);
		}else{
			print OUT $log_line;
		}
	}
	close(IN);
	close(OUT);
	rename($path_temp, $path_user);
}
# =============[ RANK ]===============
if($params{"LOGCMD"} eq "RANK"){
	### open flock bimode ####
	open(IN, $path_user);
	flock(IN, 1);
	@logdat = <IN>;
	foreach (@logdat) {
		$log_line = $_;
		@col = split("{}", $log_line);
		if($col[7] >= 5){
			$ret_dat .= ",".$col[6].":".$col[7].":".$col[2];
		}
	}
	close(IN);
	$ret_dat = "RANK".$ret_dat;
}
if($params{"LOGCMD"} eq "RANK_Y"){
	### open flock bimode ####
	open(IN, $path_user);
	flock(IN, 1);
	@logdat = <IN>;
	foreach (@logdat) {
		$log_line = $_;
		@col = split("{}", $log_line);
		if($col[9] >= 3){
			$ret_dat .= ",".$col[8].":".$col[9].":".$col[2];
		}
	}
	close(IN);
	$ret_dat = "RANK".$ret_dat;
}
# =============[ ROOM ]===============
if($params{"LOGCMD"} eq "ROOM"){
	if($params{"MAPNO"} ne "" && $params{"TARGET"} ne "" && $params{"ROUND"} ne ""){
		# FileNo
		$roomid = "1000";
		opendir DIRH, "../dat/log";
		while (my $file = readdir DIRH) {
			next if $file !~ /^[0-9]{4}.txt/;
			if($roomid < substr($file, 0, 4)){
				$roomid = substr($file, 0, 4);
			}
		}
		closedir DIRH;

		# playno
		$roomid++;
		@playnum = ("1234","1243","1324","1342","1423","1432","2134","2143","2314","2341","2413","2431","3124","3142","3214","3241","3412","3421","4123","4132","4213","4231","4312","4321");
		# Create LogFile
		$datpath = "../dat/log/".$roomid.".txt";
		### open bimode ####
		open(OUT, "> $datpath");
		print OUT "0000:0:room:".$params{"MAPNO"}.":".$params{"TARGET"}.":".$params{"ROUND"}.":".$playnum[int(rand(24))].":".$params{"TIMER"}.":".$params{"PLAYCNT"}.":".$params{"USERID"}.":".$params{"NAME"}.":".$params{"ROOMMODE"}.":".$params{"SUDDEN"}."\n";
		close(OUT);

		#Return
		$ret_dat = "ROOM,$roomid";
	}else{
		#Return
		$ret_dat = "ERROR,ROOM";
	}
}
# =============[ JOIN ]===============
if($params{"LOGCMD"} eq "JOIN"){
	if($params{"ROOMID"} ne "" && $params{"USERID"} ne ""){
		$joincnt = 0;
		$joincntA = 0;
		$joincntB = 0;
		$datpath = "../dat/log/".$params{"ROOMID"}.".txt";
		### open flock bimode ####
		open(IN, $datpath);
		flock(IN, 1);
		@logdat = <IN>;
		foreach (@logdat) {
			$uid = $params{"USERID"};
			if ($_ =~ /^....:0:join:$uid:/){
				$ret_dat = "ERROR,JOIN_UNIQUE";
				$joincnt = 9;
				last;
			}
			if ($_ =~ /^....:0:join:/){
				$joincnt++;
				if($joincnt == 4){
					$ret_dat = "ERROR,FULL";
					last;
				}
			}
			if ($_ =~ /^....:0:join:.*:.*:.*:.*:[AB]/){
				$joincntA++;
				if($joincntA == 2){
					$ret_dat = "ERROR,FULL";
					last;
				}
				if($joincntB == 2){
					$ret_dat = "ERROR,FULL";
					last;
				}
			}
		}
		close(IN);
		
		if($joincnt <= 3){
			$joincnt++;
			$username = "";
			$userrate = "0";
			$useravt = "";
			### get user data ####
			open(IN, $path_user);
			flock(IN, 1);
			@logdat = <IN>;
			foreach (@logdat) {
				if ($_ =~ /^\Q$params{"USERID"}\E\{\}/){
					@col = split("{}", $_);
					$username = $col[2];
					$useravt = $col[5];
					if($params{"MODE"} eq "YOSEN"){
						$userrate = $col[8];
					}else{
						$userrate = $col[6];
					}
					last;
				}
			}
			close(IN);
			if($username ne ""){
				### open flock bimode ####
				open(OUT, ">> $datpath"); 
				flock(OUT, 2);
				if($params{"MODE"} eq "ALLIANCE"){
					print OUT "0000:0:join:".$params{"USERID"}.":".$username.":".$useravt.":".$userrate.":".$params{"TEAM"}."\n";
				}else{
					print OUT "0000:0:join:".$params{"USERID"}.":".$username.":".$useravt.":".$userrate."\n";
				}
				if($params{"DEBUG"} eq "Y"){
					print OUT "0000:0:debug\n";;
				}
				if($joincnt == 4){
					print OUT "0000:0:full\n";
				}
				close(OUT);                 
				# return
				$ret_dat = "JOIN,".$params{"ROOMID"}.",".$joincnt;
			}else{
				$ret_dat = "ERROR,JOIN";
			}
		}
	}else{
		$ret_dat = "ERROR,JOIN";
	}
}
# =============[ LIST ]===============
if($params{"LOGCMD"} eq "LIST"){
	$ret_dat = "LIST";
	opendir DIRH, "../dat/log";
	while (my $file = readdir DIRH) {
		next if $file !~ /^[0-9]{4}.txt/;
		my $filepath = "../dat/log/".$file;
		my @stats = stat($filepath);
		if($stats[9] >= (time - 129600)){
			### open flock bimode ####
			open(IN, $filepath);
			flock(IN, 1);
			$hitflg = "y";
			$status = "0";
			$names = "";
			$result = "";
			$joincnt = 0;
			$turncnt = 0;
			$roundcnt = 0;
			@logdat = <IN>;
			foreach (@logdat) {
				if ($_ =~ /^....:0:debug/){
					$status = "9";
				}
				if ($_ =~ /^....:0:join:/){
					$status = "1";
					#Status Check
					if($stats[9] < (time - 7200)){
						$status = "2";
					}
					$joincnt++;
					@logline = split(":", $_);
					$names .= $logline[4]."{}";
				}
				if ($_ =~ /^....:[1-4]:gameend/){
					if($status ne "9"){
						$status = "3";
					}
					@logline = split(":", $_);
					$logline[4] =~ s/\r\n|\r|\n//g;
					$result .= $logline[1]."()".$logline[3]."()".$logline[4]."{}";
				}
				if ($_ =~ /^....:[1-4]:turn/){
					$turncnt++;
				}
			}
			close(IN);
			# Wait Room
			if($hitflg eq "y"){
				if($joincnt >= 1){
					$roundcnt = int(($turncnt - 1) / $joincnt) + 1;
				}
				$logdat[0] =~ s/\r\n|\r|\n//g;
				$ret_dat .= ",".substr($file, 0, 4).":".substr($logdat[0], 5).":".$joincnt.":".$status.":".$roundcnt;
				if($status eq "3"){
					$ret_dat .= ":".$names.":".$result;
				}
			}
		}
	}
	closedir DIRH;
}
# =============[ KILL ]===============
if($params{"LOGCMD"} eq "KILL"){
	$ret_dat = "KILL";
	opendir DIRH, "../dat/log";
	while (my $file = readdir DIRH) {
		next if $file =~ /^\.{1,2}$/;
		if ($file =~ /^\Q$params{"ROOMID"}.\E/){
			$killpath = "../dat/log/".$file;
			unlink($killpath);
			last;
		}
	}
	closedir DIRH;
}

# OUTPUT
print "Content-type:text/plane;charset=utf-8\n\n";
print $ret_dat;
exit(0);
