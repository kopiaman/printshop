<?php
/**
 *  
 *
 * Get the pricing set
 *  
 */	
require __DIR__ . '/autoload.php';
use Symfony\Component\Yaml\Yaml;
use \Michelf\Markdown;

/**
 * String object
 */
class PoeditString {
	public $key;
	public $value;
	public $fuzzy;
	public $comments;

	function __construct($key, $value = '', $fuzzy = false, $comments = array()) {
		$this->key = $key;
		$this->value = $value;
		$this->fuzzy = $fuzzy;
		$this->comments = (array)$comments;
	}

	public function __toString() {
		$str ='';
		foreach ($this->comments as $c) {
			$str .= "#: $c\n";
		}
		if ($this->fuzzy) $str .= "#, fuzzy\n";
		$str .= 'msgid "'.str_replace('"', '\\"', $this->key).'"' . "\n";
		$str .= 'msgstr "'.str_replace('"', '\\"', $this->value).'"' . "\n";
		$str .= "\n";
		return $str;
	}
}

/**
 * Parser object
 */
class PoeditParser {

	protected $file;
	protected $header = '';
	protected $strings = array();

	protected function _fixQuotes($str) {
		return stripslashes($str);
	}

	public function __construct($file) {
		$this->file = $file;
	}

	public function parse() {
		$contents = file_get_contents($this->file);
		$parts = preg_split('#(\r\n|\n){2}#', $contents, -1, PREG_SPLIT_NO_EMPTY);
		$this->header = array_shift($parts);

		foreach ($parts as $part) {

			// parse comments
			$comments = array();
			preg_match_all('#^\\#: (.*?)$#m', $part, $matches, PREG_SET_ORDER);
			foreach ($matches as $m) $comments[] = $m[1];

			$isFuzzy = preg_match('#^\\#, fuzzy$#im', $part) ? true : false;

			preg_match_all('# ^ (msgid|msgstr)\ " ( (?: (?>[^"\\\\]++) | \\\\\\\\ | (?<!\\\\)\\\\(?!\\\\) | \\\\" )* ) (?<!\\\\)" $ #ixm', $part, $matches2, PREG_SET_ORDER);
			$k = NULL;
            if(isset($matches2[0][2])){
                $k = $this->_fixQuotes($matches2[0][2]);	
            }
			
			$v = !empty($matches2[1][2]) ? $this->_fixQuotes($matches2[1][2]) : '';

			$this->strings[$k] = new PoeditString($k, $v, $isFuzzy, $comments);
		}

	}

	public function merge($strings) {
		foreach ((array)$strings as $str) {
			if (!in_array($str, array_keys($this->strings))) {
				$this->strings[$str] = new PoeditString($str);
			}
		}
	}

	public function getHeader() {
		return $this->header;
	}

	public function getStrings() {
		return $this->strings;
	}

	public function getJSON($language) {
		$str = array();
		foreach ($this->strings as $s) {
			if ($s->value /*&& strlen($s->value) > 0*/){
        $str[$s->key] = $s->value;
			} else {
  			$str[$s->key] = $s->key;
			}		
		}
		$result = [];
		$result[$language] = $str;
		return json_encode($result);
	}

	public function toJSON($language, $outputFilename, $varName = 'l10n') {
		$str = $this->getJSON($language);
		return file_put_contents($outputFilename, $str) !== false;
	}

	public function save($filename = null) {
		$data = $this->header . "\n\n";
		foreach ($this->strings as $str) {
			$data .= $str;
		}
		return file_put_contents($filename ? $filename : $this->file, $data) !== false;
	}
}

$result = [];
$result['status'] = true;

$data_dir = "../data/";

//load the settings
$settings = include $data_dir . "settings.php";
$language = $settings['language'];

$po_file = $data_dir . 'languages/' . $language . '.po';
$json_file = $data_dir . 'languages/' . $language . '.json';

if( filemtime($po_file) > filemtime($json_file) ) {
	$poeditParser = new PoeditParser( $po_file  );
	$poeditParser->parse();
	$poeditParser->toJSON( $language, $json_file );
}

if(file_exists($json_file)) {
	header('Content-Type: application/json');
	echo file_get_contents($json_file);
} else {
	header('HTTP/1.1 500 Internal Server Error');
}

