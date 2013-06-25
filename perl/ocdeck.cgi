#!/usr/bin/perl

use utf8;
use CGI;

# 日付
($mday,$mon,$year) = (localtime(time))[3..5];
$year += 1900;
$mon += 1;
$sysdate = $year."-".$mon."-".$mday;

# フォームデータ取得
my $cgi = new CGI;
%params = $cgi->Vars;

#返却値クリア
$ret_dat = "";

# =============[ LIST ]===============
# DECKID USERID NAME DATA ENTRYDATE
if($params{"DECKCMD"} eq "LIST"){
	if($params{"USERID"} ne ""){
		#user search
		$filepath = "../dat/user/user.txt";
		open(USER, $filepath);
		flock(USER, 1);
		@userdat = <USER>;
		foreach (@userdat) {
			$user_line = $_;
			if ($user_line =~ /^\Q$params{"USERID"}\E\{\}/){
				@col = split("{}", $user_line);
				#deck search
				$deckcnt = 0;
				@decklist = split(/:/, $col[3]);
				foreach $deckid (@decklist) {
					#Log Check
					opendir DIRH, "../dat/deck";
					while (my $file = readdir DIRH) {
						next if $file !~ /^deck[0-9]+.txt/;
						#file open
						open(DECK, "../dat/deck/".$file);
						flock(DECK, 1);
						@logdat = <DECK>;
						foreach (@logdat) {
							$log_line = $_;
							if ($log_line =~ /^\Q$deckid\E\{\}/){
								$deckcnt++;
								@col2 = split("{}", $log_line);
								$ret_dat .= ",".$col2[0].":".$col2[2].":".$col2[3];
							}
						}
						close(DECK);
					}
					closedir DIRH;
				}
				last;
			}
		}
		close(USER);
		$ret_dat = $deckcnt.$ret_dat;
	}else{
		$ret_dat = "0";
	}
}
# =============[ DECK ]===============
if($params{"DECKCMD"} eq "DECK"){
	if($params{"PID"} ne "" && $params{"DECKID"} ne ""){
		$deckcnt = 0;
		#Log Check
		opendir DIRH, "../dat/deck";
		while (my $file = readdir DIRH) {
			next if $file !~ /^deck[0-9]+.txt/;
			#file open
			open(IN, "../dat/deck/".$file);
			flock(IN, 1);
			@logdat = <IN>;
			foreach (@logdat) {
				$log_line = $_;
				if ($log_line =~ /^\Q$params{"DECKID"}\E\{\}/){
					$deckcnt++;
					@col2 = split("{}", $log_line);
					$ret_dat .= ",".$params{"PID"}.",".$col2[2].":".$col2[3];
				}
			}
			close(IN);
		}
		closedir DIRH;
		
		$ret_dat = $deckcnt.$ret_dat;
	}else{
		$ret_dat = "0";
	}
}
# =============[ ENTRY ]===============
if($params{"DECKCMD"} eq "ENTRY"){
	$maxno = 0;
	#Log Check
	opendir DIRH, "../dat/deck";
	while (my $file = readdir DIRH) {
		next if $file !~ /^deck[0-9]+.txt/;
		#file open
		open(IN, "../dat/deck/".$file);
		flock(IN, 1);
		@logdat = <IN>;
		foreach (@logdat) {
			$log_line = $_;
			if ($log_line =~ /^DT[0-9]{4}\{\}/){
				@col = split("{}", $log_line);
				$deckno = substr($col[0], 2, 4);
				if($maxno < $deckno){
					$maxno = $deckno;
				}
			}
		}
		close(IN);
	}
	closedir DIRH;
	$maxno++;
	
	if($params{"DECKDATA"} ne ""){
		$deckid = "DT".sprintf("%04d", $maxno);
		$filepath = "../dat/deck/deck1.txt";
		# Write
		open(OUT, ">> $filepath");    # 追加モードで開く
		flock(OUT, 2);               # ロック確認。ロック
		$auther = $params{"AUTHER"};
		$decknm = $params{"DECKNAME"};
		print OUT $deckid."{}".$auther."{}".$decknm."{}".$params{"DECKDATA"}."{}".$sysdate."\n";
		close(OUT);                  # closeすれば自動でロック解除
		# ID,NAME
		$ret_dat = "ENTRY,".$deckid;

		$filepath = "../dat/user/user.txt";
		$temppath = "../dat/user/user.tmp";
		# Read
		open(IN, $filepath);
		flock(IN, 1);
		@logdat = <IN>;
		# Write
		open(OUT, ">> $temppath");
		flock(OUT, 2);
		foreach (@logdat) {
			$log_line = $_;
			if ($log_line =~ /^\Q$params{"USERID"}\E\{\}/){
				@col = split("{}", $log_line);
				$col[3] .= ":".$deckid;
				print OUT join("{}", @col);
			}else{
				print OUT $log_line;
			}
		}
		close(IN);
		close(OUT);
		rename($temppath, $filepath);
	}
}
# =============[ DELETE ]===============
if($params{"DECKCMD"} eq "DELETE"){
	if($params{"USERID"} ne "" && $params{"DECKID"} ne ""){
		$filepath = "../dat/user/user.txt";
		$temppath = "../dat/user/user.tmp";
		# Read
		open(IN, $filepath);
		flock(IN, 1);
		@logdat = <IN>;
		# Write
		open(OUT, ">> $temppath");
		flock(OUT, 2);
		foreach (@logdat) {
			$log_line = $_;
			if ($log_line =~ /^\Q$params{"USERID"}\E\{\}/){
				@col = split("{}", $log_line);
				@decks = split(":", $col[3]);
				@decks = grep(!/\Q$params{"DECKID"}\E/, @decks);
				$col[3] = join(":", @decks);
				print OUT join("{}", @col);
			}else{
				print OUT $log_line;
			}
		}
		close(IN);
		close(OUT);
		rename($temppath, $filepath);
	}
}
# =============[ IMPORT ]===============
if($params{"DECKCMD"} eq "IMPORT"){
	$coldat = "";
	#Log Check
	opendir DIRH, "../dat/deck";
	while (my $file = readdir DIRH) {
		next if $file !~ /^deck[0-9]+.txt/;
		#file open
		open(IN, "../dat/deck/".$file);
		flock(IN, 1);
		@logdat = <IN>;
		foreach (@logdat){
			$log_line = $_;
			if($log_line =~ /^\Q$params{"DECKID"}\E\{\}/){
				$coldat = $log_line;
			}
		}
		close(IN);
	}
	closedir DIRH;
	
	if($coldat ne ""){
		$filepath = "../dat/user/user.txt";
		$temppath = "../dat/user/user.tmp";
		# Read
		open(IN, $filepath);
		flock(IN, 1);
		@logdat = <IN>;
		# Write
		open(OUT, ">> $temppath");
		flock(OUT, 2);
		foreach (@logdat) {
			$log_line = $_;
			if ($log_line =~ /^\Q$params{"USERID"}\E\{\}/){
				@col = split("{}", $log_line);
				if ($col[3] !~ /^\Q$params{"DECKID"}\E/){
					$col[3] .= ":".$params{"DECKID"};
				}
				print OUT join("{}", @col);
			}else{
				print OUT $log_line;
			}
		}
		close(IN);
		close(OUT);
		rename($temppath, $filepath);
	}
}

# OUTPUT
print "Content-type:text/plane;charset=utf-8\n\n";
print $ret_dat;
exit(0);
