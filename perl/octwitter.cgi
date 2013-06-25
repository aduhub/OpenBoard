#!/usr/bin/perl

BEGIN{ $| = 1; print "Content-type: text/html\n\n"; open(STDERR, ">&STDOUT"); }

use CGI;
use Encode;
use Net::Twitter::Lite;
use utf8;

my $query = CGI->new;
my $user = decode("utf8", $query->param('NAME'));
my $hhmm = decode("utf8", $query->param('HHMM'));

# twitter
my $nt = Net::Twitter::Lite->new(
	consumer_key    => '9w6mPCIS8CrvOKM7TKlXw',
	consumer_secret => 'KtZZbktxG3RtUBKOMJCtCEACkYmRDJkNpiI6Tffjs',
);
$nt->access_token('174154799-yzDTgKJcjOYvVDlYGyGFkl4Z0fLfab8Cr1JrzT0r');
$nt->access_token_secret('wUYyCEzfHU7EXZqvEjBg0TZMiQKE1w4F4f9poQpfaE');
my $result = eval { $nt->update('対戦相手募集('.$user.')'.$hhmm.' http://aa1.versus.jp/openboard/ #openboard') };
warn "$@\n" if $@;
