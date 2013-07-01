#!/usr/bin/perl

#BEGIN{ $| = 1; print "Content-type: text/html\n\n"; open(STDERR, ">&STDOUT"); }

use utf8;
use CGI;

# 初期値
%FORM = ();
$ret_logno = "0";
$ret_dat = "";

# フォームデータ取得
my $cgi = new CGI;
%FORM = $cgi->Vars;

# ログ取得
&GetLog;

# 出力
print "Content-type:text/plane;charset=utf-8\n\n";
print $ret_logno.$ret_dat;
exit(0);

#------------#
#  ログ取得  #
#------------#
sub GetLog{
	if ($FORM{"ROOMID"} ne ""){
		# File Path
		$datpath = "../dat/log/".$FORM{"ROOMID"}.".txt";
		# === Insert ===
		if(-e $datpath){
			if($FORM{"LOGCMD"} ne ""){
				@inss = ();
				@cmds = split(",", $FORM{'LOGCMD'});
				# --- Search ---
				open(IN, $datpath);
				flock(IN, 1);
				foreach $cmd (@cmds) {
					if($cmd ne ""){
						$iddup = 0;
						while (<IN>) {
							if($_ =~ /^\Q$cmd\E/){
								$iddup = 1;
								last;
							}
						}
						if($iddup == 0){
							push(@inss, $cmd);
						}
					}
				}
				close(IN);
				# --- Write ---
				foreach (@inss) {
					open(OUT, ">> $datpath");	# 追加モードで開く
					flock(OUT, 2);				# ロック確認。ロック
					print OUT $_."\n";  		# 書き込む
					close(OUT);					# closeすれば自動でロック解除
				}
			}
		}
		# === Select ===
		if(-e $datpath){
			open(IN, $datpath);
			flock(IN, 1);
			@logdat = <IN>;
			$ret_logno = $#logdat + 1;
			foreach (@logdat) {
				$ret_dat.= ",".$_;
			}
			close(IN);
		}
	}
}
