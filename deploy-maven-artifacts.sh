#!/usr/bin/env bash

#set -v -x
set -u -e

version=6.2.5d
repo_url=http://jenkins.axiell.local:8081
repo_dir=~/.m2/repository

function deployFile {
  local file=${1}
  local packaging=${2}
  local version=${3}
  local groupId=${4:-com.liferay.portal}
  local dir=${groupId//./\/}
  echo "Deploying file: ${file} packaging: ${packaging}"
  tmp_file=$(mktemp)
  cp ${repo_dir}/${dir}/${file}/${version}/${file}-${version}.${packaging} ${tmp_file}
  mvn org.apache.maven.plugins:maven-deploy-plugin:2.8.2:deploy-file -DgroupId=${groupId} -DartifactId=${file} -Dfile=${tmp_file} -DrepositoryId=central -Dversion=${version} -Dpackaging=${packaging} -Durl=${repo_url}/artifactory/simple/ext-release-local/
  rm ${tmp_file}
}

packaging=jar
for file in portal-client portal-service support-tomcat util-taglib portal-impl util-bridges portal-pacl util-java util-slf4j
do
deployFile ${file} ${packaging} ${version}
done

file=portal-web
packaging=war
deployFile ${file} ${packaging} ${version}

file=portal-parent
packaging=pom
deployFile ${file} ${packaging} ${version}
