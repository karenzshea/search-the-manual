#!/usr/bin/env bash

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)

usage() {
  cat << EOF # remove the space between << and EOF, this is due to web plugin issue
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [-v] [-f] -p param_value arg1 [arg2...]

Strip the header and footer content from each downloaded manual page.

Available options:

-h, --help      Print this help and exit
-v, --verbose   Print script debug info
-f, --flag      Some flag description
-p, --param     Some param description
EOF
  exit
}

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  # script cleanup here
}

setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

die() {
  local msg=$1
  local code=${2-1} # default exit status 1
  msg "$msg"
  exit "$code"
}

parse_params() {
  # default values of variables set from params
  #flag=0
  input_dir=''
  output_dir=''

  while :; do
    case "${1-}" in
    -h | --help) usage ;;
    -v | --verbose) set -x ;;
    --no-color) NO_COLOR=1 ;;
    #-f | --flag) flag=1 ;; # example flag
    -i | --input)
      input_dir="${2-}"
      shift
      ;;
    -o | --output)
      output_dir="${2-}"
      [[ ! -d "${output_dir}" ]] && { echo "Creating "${output_dir}" ..."; mkdir -p "${output_dir}"; }
      shift
      ;;
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  #args=("$@")

  # check required params and arguments
  [[ -z "${input_dir-}" ]] && die "Missing required parameter: input"
  [[ -z "${output_dir-}" ]] && die "Missing required parameter: output"
  #[[ ${#args[@]} -eq 0 ]] && die "Missing script arguments"

  return 0
}

parse_params "$@"
setup_colors

# script logic here
trim_file() {
    local readonly header_len=69
    local readonly footer_len=1842
    local input_file=$1
    local output_file=$2
    [[ -z "${input_file}" ]] && die "trim_file called without input file"
    [[ -z "${output_file}" ]] && die "trim_file called without output file"
    cp "${input_file}" "${output_file}"
    sed -i '' -e '1,'$header_len'd' "${output_file}"
    sed -i '' -e '/Download Live 11 manual/,+'$footer_len'd' "${output_file}"
}

trim_directory() {
    local input_dir=$1
    local output_dir=$2
    [[ -z "${input_dir}" ]] && die "trim_directory called without input directory"
    [[ -z "${output_dir}" ]] && die "trim_directory called without output directory"

    for file in "${input_dir}"/*
    do
        filename=$(basename "$file")
        trim_file "$file" "${output_dir}"/"${filename}"
    done
}

trim_directory "$input_dir" "$output_dir"

msg "${RED}Read parameters:${NOFORMAT}"
#msg "- flag: ${flag}"
msg "- input directory: ${input_dir}"
msg "- output directory: ${output_dir}"
msg "- arguments: ${args[*]-}"
